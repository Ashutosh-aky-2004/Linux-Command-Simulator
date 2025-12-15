class FileSystem {
  constructor() {
    // Initialize root directory
    this.root = {
      name: "/",
      type: "dir",
      path: "/",
      children: [],
      metadata: {
        permissions: "drwxr-xr-x",
        owner: "root",
        group: "root",
        created: new Date(),
        modified: new Date(),
      },
    };

    this.currentPath = "/home/user";
    this.homePath = "/home/user";
    this.commandHistory = [];

    // Initialize with sample structure
    this._initializeFileSystem();
  }

  _initializeFileSystem() {
    // Create home directory
    const home = this._createDir("home", this.root);
    const user = this._createDir("user", home);

    // Create sample directories
    this._createDir("Documents", user);
    this._createDir("Downloads", user);
    this._createDir("Desktop", user);

    // Create sample files with content
    this._createFile(
      "welcome.txt",
      user,
      `Welcome to Linux File System Simulator!

Try these commands:
• ls -la    # List all files with details
• cat welcome.txt    # View this file
• mkdir test    # Create directory
• rmdir test    # Remove empty directory
• rm -rf test   # Force remove
• cd..         # Windows-style cd
• cat >> file.txt  # Append to file
`
    );

    // Create hidden files
    this._createFile(
      ".bashrc",
      user,
      `# User specific aliases
alias ll='ls -la'
alias la='ls -A'
alias ..='cd ..'
`
    );

    // Create /etc directory with config
    const etc = this._createDir("etc", this.root);
    this._createFile("hosts", etc, "127.0.0.1 localhost");
  }

  _createDir(name, parent) {
    const dir = {
      name,
      type: "dir",
      path: parent.path === "/" ? `/${name}` : `${parent.path}/${name}`,
      children: [],
      metadata: {
        permissions: "drwxr-xr-x",
        owner: "user",
        group: "users",
        created: new Date(),
        modified: new Date(),
      },
      isHidden: name.startsWith("."),
    };

    parent.children.push(dir);
    parent.metadata.modified = new Date();
    return dir;
  }

  _createFile(name, parent, content = "") {
    const file = {
      name,
      type: "file",
      path: parent.path === "/" ? `/${name}` : `${parent.path}/${name}`,
      content: content,
      metadata: {
        permissions: "-rw-r--r--",
        owner: "user",
        group: "users",
        size: content.length,
        created: new Date(),
        modified: new Date(),
      },
      isHidden: name.startsWith("."),
    };

    parent.children.push(file);
    parent.metadata.modified = new Date();
    return file;
  }

  // Get node by path
  getNode(path) {
    if (path === "/") return this.root;

    const absolutePath = this.resolvePath(path);
    const parts = absolutePath.split("/").filter((p) => p);
    let current = this.root;

    for (const part of parts) {
      if (!current || current.type !== "dir") return null;

      const child = current.children.find((c) => c.name === part);
      if (!child) return null;

      current = child;
    }

    return current;
  }

  // Get current directory
  getCurrentDir() {
    return this.getNode(this.currentPath) || this.root;
  }

  // Resolve path (handle ., .., ~)
  resolvePath(path) {
    if (!path) return this.currentPath;

    // Handle ~
    if (path === "~") return this.homePath;
    if (path.startsWith("~/")) {
      path = this.homePath + path.substring(1);
    }

    // Handle absolute path
    if (path.startsWith("/")) {
      return this._normalizePath(path);
    }

    // Handle relative path
    const base = this.currentPath === "/" ? "" : this.currentPath;
    return this._normalizePath(`${base}/${path}`);
  }

  _normalizePath(path) {
    const parts = path.split("/").filter((p) => p !== "");
    const result = [];

    for (const part of parts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        if (result.length > 0) result.pop();
      } else {
        result.push(part);
      }
    }

    return "/" + result.join("/");
  }

  // Execute command
  execute(input) {
    this.commandHistory.push(input);

    // Handle Windows-style cd..
    if (input === "cd.." || input.startsWith("cd.. ")) {
      input = input.replace("cd..", "cd ..");
    }

    const parts = input.split(" ").filter((p) => p);
    if (parts.length === 0) return { output: "", error: false };

    const command = parts[0];
    const args = parts.slice(1);

    switch (command) {
      case "ls":
        return this._ls(args);
      case "cd":
        return this._cd(args);
      case "pwd":
        return this._pwd();
      case "cat":
        return this._cat(args);
      case "mkdir":
        return this._mkdir(args);
      case "rmdir":
        return this._rmdir(args);
      case "rm":
        return this._rm(args);
      case "touch":
        return this._touch(args);
      case "echo":
        return this._echo(args);
      case "clear":
        return { output: "CLEAR", error: false };
      case "help":
        return this._help();
      default:
        return {
          output: `${command}: command not found\nTry 'help' for available commands.`,
          error: true,
        };
    }
  }

  // Command implementations
  _ls(args) {
    const showAll = args.includes("-a") || args.includes("-la");
    const longFormat = args.includes("-l") || args.includes("-la");

    const dir = this.getCurrentDir();
    if (!dir || dir.type !== "dir") {
      return { output: "ls: cannot access directory", error: true };
    }

    let items = dir.children.filter((child) => {
      if (child.name === "." || child.name === "..") return showAll;
      if (child.isHidden) return showAll;
      return true;
    });

    items.sort((a, b) => {
      // Directories first
      if (a.type === "dir" && b.type !== "dir") return -1;
      if (a.type !== "dir" && b.type === "dir") return 1;
      // Then alphabetical
      return a.name.localeCompare(b.name);
    });

    if (longFormat) {
      return this._ls_long(items);
    } else {
      return this._ls_simple(items);
    }
  }

  _ls_long(items) {
    if (items.length === 0) {
      return { output: "" };
    }

    let output = "";
    items.forEach((item) => {
      const metadata = item.metadata;
      const date = metadata.modified.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });

      const name = item.isHidden ? `.${item.name}` : item.name;
      const type = item.type === "dir" ? "d" : "-";

      output += `${metadata.permissions} ${metadata.owner} ${metadata.group} `;
      output += `${(item.type === "file" ? metadata.size : 0)
        .toString()
        .padStart(8)} `;
      output += `${date} ${name}`;
      if (item.type === "dir") output += "/";
      output += "\n";
    });

    return { output: output.trim() };
  }

  _ls_simple(items) {
    if (items.length === 0) {
      return { output: "" };
    }

    let output = "";
    items.forEach((item) => {
      const name = item.isHidden ? `.${item.name}` : item.name;
      output += item.type === "dir" ? `${name}/  ` : `${name}  `;
    });

    return { output: output.trim() };
  }

  _cd(args) {
    if (args.length === 0) {
      this.currentPath = this.homePath;
      return { output: "" };
    }

    const target = args[0];
    const newPath = this.resolvePath(target);
    const node = this.getNode(newPath);

    if (!node) {
      return { output: `cd: no such directory: ${target}`, error: true };
    }

    if (node.type !== "dir") {
      return { output: `cd: not a directory: ${target}`, error: true };
    }

    this.currentPath = newPath;
    return { output: "" };
  }

  _pwd() {
    return { output: this.currentPath };
  }

  _cat(args) {
    if (args.length === 0) {
      return { output: "Usage: cat <file>", error: true };
    }

    // Check for redirection
    const redirectIndex = args.findIndex((arg) => arg === ">" || arg === ">>");
    if (redirectIndex !== -1) {
      const fileName = args[redirectIndex + 1];
      const content = args.slice(0, redirectIndex).join(" ");

      if (!fileName) {
        return { output: "cat: missing file operand", error: true };
      }

      const filePath = this.resolvePath(fileName);
      const parentPath = filePath.split("/").slice(0, -1).join("/") || "/";
      const parent = this.getNode(parentPath);

      if (!parent || parent.type !== "dir") {
        return { output: `cat: cannot create file: ${fileName}`, error: true };
      }

      const existingFile = parent.children.find(
        (c) => c.name === fileName.split("/").pop()
      );
      if (args[redirectIndex] === ">>" && existingFile) {
        // Append
        existingFile.content += content + "\n";
        existingFile.metadata.size = existingFile.content.length;
        existingFile.metadata.modified = new Date();
      } else {
        // Create or overwrite
        if (existingFile) {
          existingFile.content = content + "\n";
          existingFile.metadata.size = existingFile.content.length;
          existingFile.metadata.modified = new Date();
        } else {
          this._createFile(fileName.split("/").pop(), parent, content + "\n");
        }
      }

      return { output: "" };
    }

    // Normal cat (view file)
    const filePath = this.resolvePath(args[0]);
    const file = this.getNode(filePath);

    if (!file) {
      return { output: `cat: ${args[0]}: No such file`, error: true };
    }

    if (file.type !== "file") {
      return { output: `cat: ${args[0]}: Is a directory`, error: true };
    }

    return { output: file.content || "(empty file)" };
  }

  _mkdir(args) {
    if (args.length === 0) {
      return { output: "Usage: mkdir <directory>", error: true };
    }

    const dirName = args[0];
    const parent = this.getCurrentDir();

    if (!parent || parent.type !== "dir") {
      return { output: "mkdir: cannot create directory", error: true };
    }

    // Check if exists
    if (parent.children.some((child) => child.name === dirName)) {
      return {
        output: `mkdir: cannot create directory '${dirName}': File exists`,
        error: true,
      };
    }

    this._createDir(dirName, parent);
    return { output: `Created directory '${dirName}'` };
  }

  _rmdir(args) {
    if (args.length === 0) {
      return { output: "Usage: rmdir <directory>", error: true };
    }

    const dirName = args[0];
    const parent = this.getCurrentDir();

    if (!parent || parent.type !== "dir") {
      return { output: "rmdir: failed to remove", error: true };
    }

    const dirIndex = parent.children.findIndex(
      (child) => child.name === dirName && child.type === "dir"
    );

    if (dirIndex === -1) {
      return {
        output: `rmdir: failed to remove '${dirName}': No such file or directory`,
        error: true,
      };
    }

    const dir = parent.children[dirIndex];

    // Check if empty
    if (dir.children.length > 0) {
      return {
        output: `rmdir: failed to remove '${dirName}': Directory not empty`,
        error: true,
      };
    }

    parent.children.splice(dirIndex, 1);
    parent.metadata.modified = new Date();
    return { output: `Removed directory '${dirName}'` };
  }

  _rm(args) {
    if (args.length === 0) {
      return { output: "Usage: rm <file>", error: true };
    }

    const recursive = args.includes("-r") || args.includes("-rf");
    const name = args.find((arg) => arg !== "-r" && arg !== "-rf");

    if (!name) {
      return { output: "rm: missing operand", error: true };
    }

    const parent = this.getCurrentDir();

    if (!parent || parent.type !== "dir") {
      return { output: "rm: cannot remove", error: true };
    }

    const itemIndex = parent.children.findIndex((child) => child.name === name);

    if (itemIndex === -1) {
      return {
        output: `rm: cannot remove '${name}': No such file or directory`,
        error: true,
      };
    }

    const item = parent.children[itemIndex];

    // Check if it's a directory
    if (item.type === "dir" && !recursive) {
      return {
        output: `rm: cannot remove '${name}': Is a directory (use -r flag)`,
        error: true,
      };
    }

    parent.children.splice(itemIndex, 1);
    parent.metadata.modified = new Date();
    return { output: `Removed '${name}'` };
  }

  _touch(args) {
    if (args.length === 0) {
      return { output: "Usage: touch <file>", error: true };
    }

    const fileName = args[0];
    const parent = this.getCurrentDir();

    if (!parent || parent.type !== "dir") {
      return { output: "touch: cannot create file", error: true };
    }

    const existing = parent.children.find((child) => child.name === fileName);

    if (existing) {
      // Update timestamp
      existing.metadata.modified = new Date();
      return { output: `Updated '${fileName}'` };
    } else {
      this._createFile(fileName, parent, "");
      return { output: `Created file '${fileName}'` };
    }
  }

  _echo(args) {
    if (args.length === 0) {
      return { output: "" };
    }

    // Check for redirection
    const redirectIndex = args.findIndex((arg) => arg === ">" || arg === ">>");
    if (redirectIndex !== -1) {
      const fileName = args[redirectIndex + 1];
      const content = args.slice(0, redirectIndex).join(" ");

      if (!fileName) {
        return { output: "echo: missing file operand", error: true };
      }

      const filePath = this.resolvePath(fileName);
      const parentPath = filePath.split("/").slice(0, -1).join("/") || "/";
      const parent = this.getNode(parentPath);

      if (!parent || parent.type !== "dir") {
        return { output: `echo: cannot create file: ${fileName}`, error: true };
      }

      const existingFile = parent.children.find(
        (c) => c.name === fileName.split("/").pop()
      );
      if (args[redirectIndex] === ">>" && existingFile) {
        // Append
        existingFile.content += content + "\n";
        existingFile.metadata.size = existingFile.content.length;
        existingFile.metadata.modified = new Date();
      } else {
        // Create or overwrite
        if (existingFile) {
          existingFile.content = content + "\n";
          existingFile.metadata.size = existingFile.content.length;
          existingFile.metadata.modified = new Date();
        } else {
          this._createFile(fileName.split("/").pop(), parent, content + "\n");
        }
      }

      return { output: "" };
    }

    // Normal echo (just output)
    const text = args.join(" ");
    return { output: text };
  }

  _help() {
    const helpText = `
Available Commands:

FILE OPERATIONS:
  ls [options]          List directory contents
    -a                 Show hidden files
    -l                 Long format
    -la                Both
  cd [directory]       Change directory
    cd..              Windows-style (no space)
  pwd                 Print working directory
  cat <file>          View file content
  cat > file          Create/overwrite file
  cat >> file         Append to file
  echo <text>         Print text
  echo > file         Write to file
  echo >> file        Append to file

DIRECTORY OPERATIONS:
  mkdir <dir>         Create directory
  rmdir <dir>         Remove empty directory
  rm <file>           Remove file
  rm -r <dir>         Remove directory recursively
  rm -rf <dir>        Force remove
  touch <file>        Create/update file

UTILITIES:
  clear              Clear terminal
  help               Show this help

EXAMPLES:
  ls -la
  cat welcome.txt
  echo "hello" > file.txt
  cat >> file.txt
  mkdir test
  rm -rf test
  cd..
`;
    return { output: helpText.trim() };
  }

  // Get statistics
  getStats() {
    let dirCount = 0;
    let fileCount = 0;

    const count = (node) => {
      if (node.type === "dir") {
        dirCount++;
        node.children.forEach(count);
      } else {
        fileCount++;
      }
    };

    count(this.root);
    return { dirCount, fileCount };
  }

  // Get tree for current directory
  getTree() {
    const dir = this.getCurrentDir();
    return this._buildTree(dir, 0);
  }

  _buildTree(node, level) {
    const children = node.children || [];
    const indent = "  ".repeat(level);

    let tree = [];

    children.forEach((child) => {
      if (child.name === "." || child.name === "..") return;

      const icon = child.type === "dir" ? "📁" : "📄";
      const hidden = child.isHidden ? "." : "";
      const suffix = child.type === "dir" ? "/" : "";

      tree.push({
        name: `${hidden}${child.name}${suffix}`,
        type: child.type,
        path: child.path,
        level: level,
        indent: indent,
      });

      if (child.type === "dir") {
        tree = tree.concat(this._buildTree(child, level + 1));
      }
    });

    return tree;
  }
}
