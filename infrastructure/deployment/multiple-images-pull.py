import subprocess
from concurrent.futures import ThreadPoolExecutor
# Function to pull a docker image
def pull_docker_image(image_name):
    try:
        print(f"Pulling image: {image_name}")
        result = subprocess.run(['docker', 'pull', image_name], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode == 0:
            print(f"Successfully pulled: {image_name}")
        else:
            print(f"Failed to pull: {image_name}")
            print(result.stderr)
    except Exception as e:
        print(f"Error pulling image {image_name}: {e}")
# Function to read the docker images from a file
def read_images_from_file(file_path):
    with open(file_path, 'r') as f:
        return [line.strip() for line in f if line.strip()]
# Main function to pull images concurrently
def pull_images_concurrently(file_path, max_workers=5):
    images = read_images_from_file(file_path)
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        executor.map(pull_docker_image, images)
if __name__ == "__main__":
    input_file = '$current_dir/docker_images.txt'  # Replace with the path to your input file
    pull_images_concurrently(input_file, max_workers=5)  # You can adjust the number of workers