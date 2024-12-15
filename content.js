class PDFMessageSaver {
  constructor() {
    this.observer = new MutationObserver(this.onDomChange.bind(this));
    this.initObserver();
  }

  initObserver() {
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  onDomChange() {
    const profileButton = document.querySelector(
      '[data-testid="profile-button"]'
    );
    if (profileButton && !document.querySelector("#saveToPdf-button-group")) {
      this.createButtonGroup(profileButton);
    }
  }

  createButtonGroup(profileButton) {
    const buttonGroupContainer = document.createElement("div");
    buttonGroupContainer.className = "saveToPdf-button-group";
    buttonGroupContainer.id = "saveToPdf-button-group";

    const saveButton = this.createButton(
      "saveToPdf-button",
      "Save to PDF",
      "btn btn-primary",
      this.onSaveClick.bind(this)
    );

    const dropdownButton = this.createButton(
      "saveToPdf-dropdown-toggle",
      "▼",
      "btn btn-secondary dropdown-toggle",
      () => {
        dropdownMenu.classList.toggle("hidden");
      }
    );

    const cancelButton = this.createButton(
      "saveToPdf-cancel-button",
      "X",
      "btn btn-secondary",
      this.cancelSelectMode.bind(this)
    );

    const dropdownMenu = this.createDropdownMenu();

    buttonGroupContainer.appendChild(saveButton);
    buttonGroupContainer.appendChild(dropdownButton);
    buttonGroupContainer.appendChild(dropdownMenu);

    profileButton.parentNode.insertBefore(buttonGroupContainer, profileButton);

    this.saveButton = saveButton;
    this.cancelButton = cancelButton;
    this.dropdownButton = dropdownButton;
  }

  createButton(id, text, className, onClick) {
    const button = document.createElement("button");
    button.id = id;
    button.textContent = text;
    button.className = className;
    button.type = "button";
    button.onclick = onClick;
    return button;
  }

  createDropdownMenu() {
    const menu = document.createElement("ul");
    menu.className = "dropdown-menu hidden";
    menu.id = "saveToPdf-dropdown-menu";

    const selectMessagesOption = document.createElement("li");
    selectMessagesOption.textContent = "Select Messages";
    selectMessagesOption.addEventListener(
      "click",
      this.onSelectMessagesClick.bind(this)
    );

    menu.appendChild(selectMessagesOption);
    return menu;
  }

  onSaveClick() {
    const selectedMessages = document.querySelectorAll(".selected-message");
    if (selectedMessages.length > 0) {
      this.saveMessages(selectedMessages);
    } else {
      this.saveAllMessages();
    }
  }

  async saveMessages(selectedMessages) {
    if (selectedMessages.length === 0) {
      alert("No messages selected.");
      return;
    }

    const container = this.createPdfContainer(selectedMessages);
    await this.generatePdf(container, "selected_messages.pdf");
    this.cancelSelectMode();
  }

  async saveAllMessages() {
    const messages = document.querySelectorAll(
      "[data-testid^='conversation-turn-']"
    );
    await this.saveMessages(messages);
  }

  async generatePdf(content, filename) {
    const options = {
      margin: 40,
      filename,
      pagebreak: { mode: ["css", "avoid-all"] },
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(options).from(content).save();
    } catch (error) {
      console.error("Failed to save PDF:", error);
      alert("Failed to save PDF.");
    }
  }

  createPdfContainer(messages) {
    const container = document.createElement("div");
    messages.forEach((msg, index) => {
      const cloned = msg.cloneNode(true);
      container.appendChild(cloned);
      if (index < messages.length - 1) {
        const divider = document.createElement("div");
        divider.style.borderTop = "1px solid #ccc";
        divider.style.margin = "10px 0";
        container.appendChild(divider);
      }
    });
    return container;
  }

  onSelectMessagesClick() {
    const messages = document.querySelectorAll(
      "[data-testid^='conversation-turn-']"
    );
    messages.forEach((msg) => {
      msg.classList.add("selectable-message");
      msg.addEventListener("click", this.toggleMessageSelection);
    });

    this.saveButton.textContent = "Save 0 Selected Messages";
    this.dropdownButton.classList.add("hidden");
    this.cancelButton.classList.remove("hidden");
  }

  toggleMessageSelection(event) {
    const message = event.currentTarget;
    message.classList.toggle("selected-message");
    const selectedCount = document.querySelectorAll(".selected-message").length;
    document.querySelector(
      "#saveToPdf-button"
    ).textContent = `Save ${selectedCount} Selected Messages`;
  }

  cancelSelectMode() {
    const messages = document.querySelectorAll(
      "[data-testid^='conversation-turn-']"
    );
    messages.forEach((msg) =>
      msg.classList.remove("selectable-message", "selected-message")
    );
    this.saveButton.textContent = "Save to PDF";
    this.cancelButton.classList.add("hidden");
    this.dropdownButton.classList.remove("hidden");
  }

  onDropdownClick(event) {
    const menu = event.currentTarget.nextElementSibling;
    menu.classList.toggle("hidden");
  }
}

new PDFMessageSaver();
