Live url: https://ashutosh-aky-2004.github.io/Linux-Command-Simulator/

# Linux File System Simulator v3.0

A powerful, web-based Linux terminal and file system simulator that brings the command-line experience to your browser. This project simulates a functional file system structure, allowing users to execute standard Linux commands, manage files, and navigate directories in a safe, virtual environment.

## Features

- **Realistic Terminal Interface**: complete with command history, syntax highlighting, and authentic styling.
- **Virtual File System**: Fully simulated file system with support for:
  - Nested directories
  - File creation and editing
  - Permissions, ownership groups, and timestamps
- **Visual File Explorer**: Real-time directory tree visualization and file system statistics.
- **Command Chaining & Redirection**: Support for input/output redirection (`>`, `>>`).
- **Interactive Experience**:
  - Command history navigation (Up/Down arrows)
  - Quick action buttons for common commands
  - Click-to-navigate directory tree

## 🛠️ Built With

- **HTML5**: Semantic structure.
- **Tailwind CSS**: Modern, utility-first styling for a responsive design.
- **JavaScript (ES6+)**: Core logic for the terminal controller and file system emulation.
- **Font Awesome**: Icons for the UI.

## 💻 Available Commands

### File Operations

| Command | Description                      | Example                 |
| ------- | -------------------------------- | ----------------------- |
| `ls`    | List directory contents          | `ls -la`                |
| `cd`    | Change directory                 | `cd Documents`          |
| `pwd`   | Print working directory          | `pwd`                   |
| `cat`   | View, create, or append to files | `cat file.txt`          |
| `touch` | Create or update file timestamps | `touch newfile.md`      |
| `rm`    | Remove files                     | `rm file.txt`           |
| `echo`  | Print text or write to files     | `echo "Hello" > hi.txt` |

### Directory Operations

| Command | Description                  | Example             |
| ------- | ---------------------------- | ------------------- |
| `mkdir` | Create a new directory       | `mkdir my_folder`   |
| `rmdir` | Remove an empty directory    | `rmdir old_folder`  |
| `rm -r` | Recursively remove directory | `rm -rf bad_folder` |

### Utilities

- `clear`: Clear the terminal screen.
- `help`: Display the help menu with all available commands.

## 📂 Project Structure

```
Linux Command Simulator/
├── index.html      # Main entry point and UI layout
├── styles.css      # Custom styles and animations
├── terminal.js     # Handles user input, UI updates, and command history
├── filesystem.js   # Logical implementation of the virtual file system
└── README.md       # Project documentation
```

## Getting Started

1. **Clone the repository** (or download the files):
   ```bash
   git clone <repository-url>
   ```
2. **Open the project**:
   Simply open `index.html` in any modern web browser. No server or build step allows for instant usage!

## Usage Guide

- **Navigation**: Use `cd` to move around folders. `cd ..` works to go back up one level.
- **Creating Files**:
  - `touch filename.txt` creates an empty file.
  - `echo "content" > filename.txt` creates a file with content.
  - `cat > filename.txt` allows not just viewing, but creating files via redirection (simulated).
- **History**: Press `Arrow Up` to recall previous commands.
- **Shortcuts**: Click the buttons below the input line for quick execution of `ls`, `pwd`, etc.

