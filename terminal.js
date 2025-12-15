class TerminalController {
  constructor() {
    this.fs = new FileSystem();
    this.isInteractiveMode = false;
    this.interactiveBuffer = "";
    this.interactiveFile = "";
    this.history = [];
    this.historyIndex = -1;

    // DOM Elements
    this.terminalOutput = document.getElementById("terminal-output");
    this.commandInput = document.getElementById("command-input");
    this.executeBtn = document.getElementById("execute-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.currentPathElement = document.getElementById("current-path");
    this.dirCountElement = document.getElementById("dir-count");
    this.fileCountElement = document.getElementById("file-count");
    this.directoryTree = document.getElementById("directory-tree");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showWelcome();
    this.updateUI();
    this.showPrompt();
    this.commandInput.focus();
  }

  setupEventListeners() {
    // Execute command
    this.executeBtn.addEventListener("click", () => this.executeCommand());
    this.commandInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.executeCommand();
    });

    // Clear terminal
    this.clearBtn.addEventListener("click", () => this.clearTerminal());

    // History navigation
    this.commandInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory(1);
      }
    });

    // Quick commands
    document.querySelectorAll(".quick-cmd").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cmd = e.target.closest(".quick-cmd").getAttribute("data-cmd");
        this.commandInput.value = cmd;
        this.commandInput.focus();
      });
    });

    // Ctrl+L to clear
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        this.clearTerminal();
      }
    });
  }

  showWelcome() {
    this.addOutput('Type "help" for available commands', "system");
    this.addOutput("-----------------------------------", "system");
  }

  addOutput(text, type = "output") {
    const line = document.createElement("div");
    line.className = "mb-1 fade-in";

    if (type !== "system") {
      const prompt = document.createElement("span");
      prompt.className = "text-emerald-400 mr-2 font-mono";
      prompt.textContent = this.getPrompt();
      line.appendChild(prompt);
    }

    const content = document.createElement("span");

    switch (type) {
      case "error":
        content.className = "text-red-400 font-mono";
        break;
      case "success":
        content.className = "text-emerald-400 font-mono";
        break;
      case "system":
        content.className = "text-slate-400 font-mono";
        break;
      case "command":
        content.className = "text-amber-300 font-mono";
        break;
      default:
        content.className = "text-slate-200 font-mono";
    }

    // Preserve line breaks
    if (text.includes("\n")) {
      const lines = text.split("\n");
      lines.forEach((lineText, i) => {
        if (i > 0) {
          const br = document.createElement("div");
          br.className = "ml-6";
          br.textContent = lineText;
          content.appendChild(br);
        } else {
          content.textContent = lineText;
        }
      });
    } else {
      content.textContent = text;
    }

    line.appendChild(content);
    this.terminalOutput.appendChild(line);
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  getPrompt() {
    const path = this.fs.currentPath;
    const displayPath = path === this.fs.homePath ? "~" : path;
    return `user@linux-sim:${displayPath}$`;
  }

  showPrompt() {
    const line = document.createElement("div");
    line.className = "mb-2";

    const prompt = document.createElement("span");
    prompt.className = "text-emerald-400 font-mono";
    prompt.textContent = this.getPrompt() + " ";
    line.appendChild(prompt);

    const cursor = document.createElement("span");
    cursor.className = "typewriter";
    cursor.textContent = " ";
    line.appendChild(cursor);

    this.terminalOutput.appendChild(line);
    this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
  }

  executeCommand() {
    const input = this.commandInput.value.trim();
    if (!input) return;

    // Add to history
    this.history.push(input);
    this.historyIndex = this.history.length;

    // Show command
    this.addOutput(input, "command");

    // Execute
    const result = this.fs.execute(input);

    // Clear input
    this.commandInput.value = "";

    // Handle special commands
    if (result.output === "CLEAR") {
      this.clearTerminal();
      return;
    }

    // Show result
    if (result.output) {
      this.addOutput(result.output, result.error ? "error" : "output");
    }

    // Update UI
    this.updateUI();
    this.showPrompt();
  }

  clearTerminal() {
    this.terminalOutput.innerHTML = "";
    this.showWelcome();
    this.showPrompt();
    this.commandInput.focus();
  }

  navigateHistory(direction) {
    if (this.history.length === 0) return;

    this.historyIndex = Math.max(
      0,
      Math.min(this.history.length, this.historyIndex + direction)
    );

    if (this.historyIndex === this.history.length) {
      this.commandInput.value = "";
    } else {
      this.commandInput.value = this.history[this.historyIndex];
    }

    this.commandInput.focus();
    this.commandInput.selectionStart = this.commandInput.selectionEnd =
      this.commandInput.value.length;
  }

  updateUI() {
    // Update current path
    this.currentPathElement.textContent = this.fs.currentPath;

    // Update statistics
    const stats = this.fs.getStats();
    this.dirCountElement.textContent = stats.dirCount;
    this.fileCountElement.textContent = stats.fileCount;

    // Update directory tree
    this.renderDirectoryTree();
  }

  renderDirectoryTree() {
    const tree = this.fs.getTree();
    this.directoryTree.innerHTML = "";

    if (tree.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-slate-500 text-sm italic py-4 text-center";
      empty.textContent = "(empty directory)";
      this.directoryTree.appendChild(empty);
      return;
    }

    tree.forEach((item) => {
      const element = document.createElement("div");
      element.className = "directory-item flex items-center py-1";
      element.style.marginLeft = `${item.level * 16}px`;

      const icon = document.createElement("span");
      icon.className = "mr-2";
      icon.innerHTML =
        item.type === "dir"
          ? '<i class="fas fa-folder text-amber-400"></i>'
          : '<i class="fas fa-file text-slate-400"></i>';

      const name = document.createElement("span");
      name.className = "text-sm font-mono";
      name.textContent = item.name;

      // Click handler
      element.addEventListener("click", () => {
        if (item.type === "dir") {
          this.commandInput.value = `cd ${item.name.replace(/[/.]/g, "")}`;
          this.executeCommand();
        } else {
          this.commandInput.value = `cat ${item.name}`;
          this.executeCommand();
        }
      });

      element.appendChild(icon);
      element.appendChild(name);
      this.directoryTree.appendChild(element);
    });
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  window.terminal = new TerminalController();
});
