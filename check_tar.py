import os
import shutil
import tarfile
import git
from git import Repo
import glob
import subprocess


# ===== USER CONFIGURATION =====
# Set the path to the folder containing Original, Imperfect, and Correct subfolders
BASE_FOLDER = "/Code_Playground/RepoDepo"  # Change this to your folder path
# =============================


def process_folder(base_folder):
   """
   Process a folder containing Original, Imperfect, and Correct subfolders with git repositories.
   Output uncommitted changes, create committed repos if needed, and always package them into TAR files.
  
   Args:
       base_folder (str): Path to the folder containing the three repository folders
   """
   print(f"Processing folder: {base_folder}")
  
   # Check if the required folders exist
   for folder_type in ['Original', 'Imperfect', 'Correct']:
       folder_path = os.path.join(base_folder, folder_type)
       if not os.path.exists(folder_path):
           print(f"ERROR: {folder_type} folder not found at {folder_path}")
           return
  
   # Check for multiple subfolders in each directory first
   for folder_type in ['Original', 'Imperfect', 'Correct']:
       folder_path = os.path.join(base_folder, folder_type)
      
       # Check if there are any files/folders (excluding hidden ones) in the folder
       has_content = False
       for item in os.listdir(folder_path):
           if not item.startswith('.'):
               has_content = True
               break
      
       if not has_content:
           print(f"ERROR: {folder_type} folder is empty")
           return
      
       # Check for multiple subfolders that could be potential repositories
       subfolders = [f for f in os.listdir(folder_path)
                    if os.path.isdir(os.path.join(folder_path, f)) and not f.startswith('.')]
      
       if len(subfolders) > 1:
           print(f"ERROR: {folder_type} folder contains multiple subfolders: {subfolders}")
           print(f"Please ensure there is only one folder in each of the Original, Imperfect, and Correct directories.")
           return
  
   # Track if any repo has uncommitted changes
   has_uncommitted_changes = False
   has_commit_mismatch = False  # Track if there's a mismatch in commit messages
   has_uninitialized_repos = False  # Track if any repo is not initialized
   has_troublesome_files = False  # Track if troublesome files were found and removed
   repo_folders = {}
   repo_names = {}  # To store the original repo names
   repo_objects = {}  # To store the actual repo objects
  
   # First check if all folders have git repos and initialize them if needed
   for folder_type in ['Original', 'Imperfect', 'Correct']:
       folder_path = os.path.join(base_folder, folder_type)
      
       # Find git repo within the folder
       repo_folder = find_git_repo_folder(folder_path)
      
       # Get the one subfolder if it exists (we already verified there's at most one)
       subfolders = [f for f in os.listdir(folder_path)
                    if os.path.isdir(os.path.join(folder_path, f)) and not f.startswith('.')]
      
       if not repo_folder:
           print(f"WARNING: {folder_type} folder does not contain a git repository. Initializing one...")
          
           # Find the appropriate folder to initialize git in
           # If there's exactly one subfolder, use that as the repo folder
           if len(subfolders) == 1:
               # There's exactly one subfolder, use that as the repo folder
               repo_folder = os.path.join(folder_path, subfolders[0])
           else:
               # Otherwise use the folder itself
               repo_folder = folder_path
          
           # Initialize git repository
           git.Repo.init(repo_folder)
           print(f"Initialized git repository in {repo_folder}")
           has_uninitialized_repos = True
          
           # Auto-add all files in the newly initialized repo
           repo = git.Repo(repo_folder)
           repo.git.add('--all')
          
           # Make an initial commit if there are files to commit
           if repo.git.status('--porcelain'):
               repo.git.commit('-m', "Initial commit")
               print(f"Made initial commit in {repo_folder}")
      
       # Store the repo folder path
       repo_folders[folder_type] = repo_folder
      
       # Get the repo name (the last part of the path)
       repo_name = os.path.basename(repo_folder)
       repo_names[folder_type] = repo_name
      
       # Check for and remove troublesome files
       if remove_troublesome_files(repo_folder):
           has_troublesome_files = True
           print(f"Removed troublesome files from {folder_type} repository")
           has_uncommitted_changes = True  # Force recommit since files were removed
  
   # Process all git repositories for changes
   for folder_type in ['Original', 'Imperfect', 'Correct']:
       if folder_type not in repo_folders:
           continue
          
       repo_folder = repo_folders[folder_type]
      
       try:
           # Open the repository
           repo = git.Repo(repo_folder)
           repo_objects[folder_type] = repo
          
           # Analyze the git repository
           num_diffs, diff_paths = analyze_git_repo_simple(repo_folder)
          
           # Output the number of uncommitted/untracked files
           print(f"{folder_type}: Found {num_diffs} uncommitted/untracked files in repo '{repo_names[folder_type]}'")
           if num_diffs > 0:
               print(f"  Uncommitted/untracked files: {diff_paths}")
               has_uncommitted_changes = True
       except Exception as e:
           print(f"Error analyzing git repo for {folder_type}: {e}")
  
   # Check if all repos were found
   if all(folder_type in repo_objects for folder_type in ['Original', 'Imperfect', 'Correct']):
       # Check if the most recent commit message from Original is present in Imperfect and Correct
       try:
           original_commits = list(repo_objects['Original'].iter_commits(max_count=10))
          
           if original_commits:
               # Get the most recent commit message from Original
               latest_original_commit_msg = original_commits[0].message.strip()
               print(f"Latest commit message in Original repo: '{latest_original_commit_msg}'")
              
               # Check if this commit message exists in Imperfect and Correct
               for repo_type in ['Imperfect', 'Correct']:
                   commit_found = False
                  
                   # Look through commits in the repo
                   for commit in repo_objects[repo_type].iter_commits(max_count=20):
                       if commit.message.strip() == latest_original_commit_msg:
                           commit_found = True
                           print(f"{repo_type} repo contains the latest Original commit message")
                           break
                  
                   if not commit_found:
                       print(f"WARNING: {repo_type} repo does not contain the latest Original commit message")
                       has_commit_mismatch = True
           else:
               print("Original repo has no commits to check")
       except Exception as e:
           print(f"Error checking commit messages: {e}")
  
   # Check if we need to fix repos
   should_fix_repos = has_uncommitted_changes or has_commit_mismatch or has_uninitialized_repos or has_troublesome_files
  
   # Create "Committed Repos" folder
   committed_repos_folder = os.path.join(base_folder, "Committed Repos")
   os.makedirs(committed_repos_folder, exist_ok=True)
  
   # If repos need fixing, create fixed versions then package them
   if should_fix_repos and all(folder_type in repo_folders for folder_type in ['Original', 'Imperfect', 'Correct']):
       try:
           # Create subfolders in Committed Repos folder
           committed_original_folder = os.path.join(committed_repos_folder, "Original")
           committed_imperfect_folder = os.path.join(committed_repos_folder, "Imperfect")
           committed_correct_folder = os.path.join(committed_repos_folder, "Correct")
          
           for folder in [committed_original_folder, committed_imperfect_folder, committed_correct_folder]:
               os.makedirs(folder, exist_ok=True)
          
           # Get repo names
           original_repo_name = repo_names.get('Original', 'repo')
           imperfect_repo_name = repo_names.get('Imperfect', 'repo')
           correct_repo_name = repo_names.get('Correct', 'repo')
          
           # 1. Process Original repo - commit any uncommitted changes
           original_repo_path = repo_folders['Original']
           committed_original_repo_path = os.path.join(committed_original_folder, original_repo_name)
           create_committed_repo(original_repo_path, committed_original_repo_path, "initial commit for project")
          
           # 2. Process Imperfect repo - clone from Original and add Imperfect files
           imperfect_repo_path = repo_folders['Imperfect']
           committed_imperfect_repo_path = os.path.join(committed_imperfect_folder, imperfect_repo_name)
           clone_and_add_new_files(committed_original_repo_path, imperfect_repo_path,
                                  committed_imperfect_repo_path, "imperfect model code")
          
           # 3. Process Correct repo - clone from Original and add Correct files
           correct_repo_path = repo_folders['Correct']
           committed_correct_repo_path = os.path.join(committed_correct_folder, correct_repo_name)
           clone_and_add_new_files(committed_original_repo_path, correct_repo_path,
                                 committed_correct_repo_path, "correct code")
          
           # 4. Create TAR files from committed repos
           tar_file_paths = []
          
           # Original TAR
           original_tar_name = f"{original_repo_name}_original.tar"
           original_tar_path = os.path.join(committed_repos_folder, original_tar_name)
           create_tar_file(committed_original_repo_path, original_tar_path)
           tar_file_paths.append(original_tar_path)
          
           # Imperfect TAR
           imperfect_tar_name = f"{imperfect_repo_name}_imperfect.tar"
           imperfect_tar_path = os.path.join(committed_repos_folder, imperfect_tar_name)
           create_tar_file(committed_imperfect_repo_path, imperfect_tar_path)
           tar_file_paths.append(imperfect_tar_path)
          
           # Correct TAR
           correct_tar_name = f"{correct_repo_name}_correct.tar"
           correct_tar_path = os.path.join(committed_repos_folder, correct_tar_name)
           create_tar_file(committed_correct_repo_path, correct_tar_path)
           tar_file_paths.append(correct_tar_path)
          
           print("Created TAR files:")
           for tar_path in tar_file_paths:
               print(f"  - {os.path.basename(tar_path)}")
          
           if has_uninitialized_repos:
               print("Successfully initialized git repositories")
           if has_uncommitted_changes:
               print("Successfully fixed uncommitted changes")
           if has_commit_mismatch:
               print("Successfully fixed commit message mismatch - all repos now share commit history")
           if has_troublesome_files:
               print("Successfully removed troublesome hidden files and build artifacts")
       except Exception as e:
           print(f"Error creating committed repos: {e}")
  
   # If repos don't need fixing, just create TAR files from the original repos
   elif all(folder_type in repo_folders for folder_type in ['Original', 'Imperfect', 'Correct']):
       try:
           print("No issues found. Creating TAR files from original repositories...")
          
           # Get repo names
           original_repo_name = repo_names.get('Original', 'repo')
           imperfect_repo_name = repo_names.get('Imperfect', 'repo')
           correct_repo_name = repo_names.get('Correct', 'repo')
          
           # Create TAR files from original repos
           tar_file_paths = []
          
           # Original TAR
           original_tar_name = f"{original_repo_name}_original.tar"
           original_tar_path = os.path.join(committed_repos_folder, original_tar_name)
           create_tar_file(repo_folders['Original'], original_tar_path)
           tar_file_paths.append(original_tar_path)
          
           # Imperfect TAR
           imperfect_tar_name = f"{imperfect_repo_name}_imperfect.tar"
           imperfect_tar_path = os.path.join(committed_repos_folder, imperfect_tar_name)
           create_tar_file(repo_folders['Imperfect'], imperfect_tar_path)
           tar_file_paths.append(imperfect_tar_path)
          
           # Correct TAR
           correct_tar_name = f"{correct_repo_name}_correct.tar"
           correct_tar_path = os.path.join(committed_repos_folder, correct_tar_name)
           create_tar_file(repo_folders['Correct'], correct_tar_path)
           tar_file_paths.append(correct_tar_path)
          
           print("Created TAR files:")
           for tar_path in tar_file_paths:
               print(f"  - {os.path.basename(tar_path)}")
       except Exception as e:
           print(f"Error creating TAR files: {e}")
   else:
       print("Missing one or more repositories. Cannot create TAR files.")
  
   return should_fix_repos




def remove_troublesome_files(folder_path):
   """
   Remove troublesome hidden files from a folder and its subdirectories.
   Also runs cargo clean if Cargo.toml exists, removes node_modules folders,
   and removes any .tar files.
  
   Args:
       folder_path (str): Path to the folder to clean
      
   Returns:
       bool: True if any files were removed or cleaned, False otherwise
   """
   files_removed = False
  
   # Find and remove .DS_Store files
   ds_store_files = glob.glob(os.path.join(folder_path, '**/.DS_Store'), recursive=True)
   for file in ds_store_files:
       os.remove(file)
       print(f"Removed .DS_Store file: {file}")
       files_removed = True
  
   # Find and remove Thumbs.db files
   thumbs_db_files = glob.glob(os.path.join(folder_path, '**/Thumbs.db'), recursive=True)
   for file in thumbs_db_files:
       os.remove(file)
       print(f"Removed Thumbs.db file: {file}")
       files_removed = True
  
   # Find and remove __pycache__ directories and node_modules directories
   for root, dirs, files in os.walk(folder_path, topdown=True):
       if '__pycache__' in dirs:
           pycache_path = os.path.join(root, '__pycache__')
           shutil.rmtree(pycache_path)
           print(f"Removed __pycache__ directory: {pycache_path}")
           files_removed = True
      
       # Remove node_modules directories
       if 'node_modules' in dirs:
           node_modules_path = os.path.join(root, 'node_modules')
           shutil.rmtree(node_modules_path)
           print(f"Removed node_modules directory: {node_modules_path}")
           files_removed = True
  
   # Find and remove .tar files
   tar_files = glob.glob(os.path.join(folder_path, '**/*.tar'), recursive=True)
   tar_files.extend(glob.glob(os.path.join(folder_path, '**/*.tar.gz'), recursive=True))
   tar_files.extend(glob.glob(os.path.join(folder_path, '**/*.tgz'), recursive=True))
   for file in tar_files:
       os.remove(file)
       print(f"Removed tar file: {file}")
       files_removed = True
  
   # Run cargo clean if Cargo.toml exists
   cargo_toml_files = glob.glob(os.path.join(folder_path, '**/Cargo.toml'), recursive=True)
   for cargo_file in cargo_toml_files:
       cargo_dir = os.path.dirname(cargo_file)
       try:
           # Change to the directory containing Cargo.toml
           current_dir = os.getcwd()
           os.chdir(cargo_dir)
          
           # Run cargo clean
           print(f"Running 'cargo clean' in {cargo_dir}")
           result = subprocess.run(['cargo', 'clean'],
                                  capture_output=True,
                                  text=True,
                                  check=False)
          
           if result.returncode == 0:
               print(f"Successfully cleaned Rust build artifacts in {cargo_dir}")
               files_removed = True
           else:
               print(f"Warning: cargo clean failed in {cargo_dir}: {result.stderr}")
              
           # Change back to the original directory
           os.chdir(current_dir)
          
       except Exception as e:
           print(f"Error running cargo clean in {cargo_dir}: {e}")
           # Make sure we return to the original directory even if an error occurs
           if 'current_dir' in locals():
               os.chdir(current_dir)
  
   return files_removed




def create_tar_file(source_folder, tar_file_path):
   """
   Create a TAR file from a folder.
  
   Args:
       source_folder (str): Folder to archive
       tar_file_path (str): Path where the TAR file will be created
   """
   # Get the parent directory and base folder name
   parent_dir = os.path.dirname(source_folder)
   folder_name = os.path.basename(source_folder)
  
   # Create the tar file
   with tarfile.open(tar_file_path, 'w') as tar:
       # Change to the parent directory to make paths relative
       current_dir = os.getcwd()
       os.chdir(parent_dir)
      
       try:
           # Add the folder to the tarfile
           tar.add(folder_name)
       finally:
           # Change back to the original directory
           os.chdir(current_dir)
  
   print(f"Created TAR file: {tar_file_path}")




def create_committed_repo(source_repo_path, target_path, commit_message):
   """
   Create a fully committed version of a repository.
  
   Args:
       source_repo_path (str): Path to the source repository
       target_path (str): Path where the committed repository will be created
       commit_message (str): Message for the commit
   """
   # Clone the repository including the .git folder
   if os.path.exists(target_path):
       shutil.rmtree(target_path)
   shutil.copytree(source_repo_path, target_path)
  
   # Remove any troublesome files from the target
   remove_troublesome_files(target_path)
  
   # Open the repository
   repo = git.Repo(target_path)
  
   # Add all files
   repo.git.add('--all')
  
   # Check if there are files to commit
   if repo.git.status('--porcelain'):
       # Commit all files
       repo.git.commit('-m', commit_message)
       print(f"Created committed repo at {target_path} with message: {commit_message}")
   else:
       print(f"No uncommitted changes in {target_path}")




def clone_and_add_new_files(original_committed_path, additional_repo_path, target_path, commit_message):
   """
   Clone the committed original repo, remove all files except .git,
   then add only the files from the additional repo.
  
   Args:
       original_committed_path (str): Path to the original committed repository
       additional_repo_path (str): Path to the repository with additional files
       target_path (str): Path where the new repository will be created
       commit_message (str): Message for the commit
   """
   # Clone the original committed repository (complete with git history)
   if os.path.exists(target_path):
       shutil.rmtree(target_path)
   shutil.copytree(original_committed_path, target_path)
  
   # Remove all files from target except .git directory
   for item in os.listdir(target_path):
       if item != '.git':
           item_path = os.path.join(target_path, item)
           if os.path.isdir(item_path):
               shutil.rmtree(item_path)
           else:
               os.remove(item_path)
  
   # Copy files from the additional repository (excluding .git folder)
   copy_folder_contents(additional_repo_path, target_path, exclude=['.git'])
  
   # Remove any troublesome files that might have been copied
   remove_troublesome_files(target_path)
  
   # Open the repository
   repo = git.Repo(target_path)
  
   # Add all files
   repo.git.add('--all')
  
   # Check if there are files to commit
   if repo.git.status('--porcelain'):
       # Commit all files
       repo.git.commit('-m', commit_message)
       print(f"Created repository at {target_path} with original history plus new commit: {commit_message}")
   else:
       print(f"No changes to commit in {target_path}")




def copy_folder_contents(source_folder, target_folder, exclude=None):
   """
   Copy contents from source folder to target folder, excluding specified paths.
  
   Args:
       source_folder (str): Source folder path
       target_folder (str): Target folder path
       exclude (list): List of paths to exclude
   """
   if exclude is None:
       exclude = []
  
   for item in os.listdir(source_folder):
       if item in exclude:
           continue
          
       source_item = os.path.join(source_folder, item)
       target_item = os.path.join(target_folder, item)
      
       if os.path.isdir(source_item):
           # Create the target directory if it doesn't exist
           os.makedirs(target_item, exist_ok=True)
           # Copy contents recursively
           copy_folder_contents(source_item, target_item, exclude)
       else:
           # Copy file
           shutil.copy2(source_item, target_item)




def find_git_repo_folder(base_folder):
   """
   Find the git repository folder within the given base folder.
   The repository might be in a subfolder of the extracted tarball.
  
   Args:
       base_folder (str): The folder to search in
      
   Returns:
       str: Path to the git repository folder or None if not found
   """
   # First check if the base folder itself is a git repo
   if os.path.isdir(os.path.join(base_folder, '.git')):
       return base_folder
  
   # Otherwise, search through subdirectories
   for root, dirs, files in os.walk(base_folder):
       if '.git' in dirs:
           return root
  
   return None




def analyze_git_repo_simple(repo_path):
   """
   Analyze a git repository to extract diff information, including untracked files.
   Excludes hidden files and directories (starting with a dot).
  
   Args:
       repo_path (str): Path to the git repository
      
   Returns:
       tuple: (number of diffs, list of diff file paths)
   """
   try:
       repo = git.Repo(repo_path)
       # Get modified files
       diffs = repo.index.diff(None)
      
       diff_list = []
       for d in diffs:
           if hasattr(d, 'a_path'):
               # Skip hidden files (those starting with a dot)
               path_parts = d.a_path.split('/')
               if not any(part.startswith('.') for part in path_parts):
                   diff_list.append(d.a_path)
      
       # Get untracked files and add them to the list
       untracked_files = repo.untracked_files
       for file in untracked_files:
           # Skip hidden files (those starting with a dot)
           path_parts = file.split('/')
           if not any(part.startswith('.') for part in path_parts):
               diff_list.append(file)
      
       return len(diff_list), diff_list
   except Exception as e:
       print(f"Error analyzing git repo: {e}")
       return 0, []




if __name__ == "__main__":
   if not os.path.isdir(BASE_FOLDER):
       print(f"Error: {BASE_FOLDER} is not a valid directory")
   else:
       process_folder(BASE_FOLDER)


