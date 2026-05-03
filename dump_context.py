import os

ignore_dirs = {'.git', 'node_modules', 'venv', 'dist', '__pycache__', '.vercel', 'signetra-extension'}
ignore_exts = {'.jpg', '.png', '.mp4', '.webp', '.zip', '.sqlite3', '.pyc', '.pdf', '.DS_Store', '.db'}

output_file = 'signetra_full_context.txt'

with open(output_file, 'w', encoding='utf-8') as outfile:
    # First write the directory structure
    outfile.write("================================================================================\n")
    outfile.write("PROJECT DIRECTORY STRUCTURE\n")
    outfile.write("================================================================================\n\n")
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        level = root.replace('.', '').count(os.sep)
        indent = ' ' * 4 * (level)
        outfile.write(f"{indent}{os.path.basename(root)}/\n")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if not any(f.endswith(ext) for ext in ignore_exts):
                outfile.write(f"{subindent}{f}\n")

    outfile.write("\n\n")
    
    # Then write all file contents
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if any(file.endswith(ext) for ext in ignore_exts):
                continue
            filepath = os.path.join(root, file)
            # Skip the script itself and the output file
            if file == 'dump_context.py' or file == output_file:
                continue
                
            outfile.write(f"\n\n{'='*80}\n")
            outfile.write(f"FILE: {filepath}\n")
            outfile.write(f"{'='*80}\n\n")
            try:
                with open(filepath, 'r', encoding='utf-8') as infile:
                    outfile.write(infile.read())
            except Exception as e:
                outfile.write(f"[Could not read file: {e}]\n")

print(f"Successfully created {output_file}")
