class PDFMessageSaver {
  constructor() {
    this.observer = new MutationObserver(this.onDomChange.bind(this));
    this.isInitialized = false;
    this.initObserver();
  }

  initObserver() {
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  onDomChange() {
    // Skip if already initialized or button exists
    if (this.isInitialized || 
        document.querySelector("#saveToPdf-button-group") || 
        document.querySelector("#saveToPdf-button") ||
        this.saveButton) {
      return;
    }

    // First try to find the conversation header actions area
    const headerActions = document.querySelector('#conversation-header-actions');
    const shareButton = document.querySelector('[data-testid="share-chat-button"]');
    
    if (headerActions && shareButton) {
      console.log('Creating button group in header actions...');
      this.isInitialized = true;
      this.observer.disconnect(); // Temporarily stop observing
      this.createButtonGroupInHeader(headerActions, shareButton);
      // Restart observing after a brief delay
      setTimeout(() => {
        this.observer.observe(document.body, { childList: true, subtree: true });
      }, 100);
      return;
    }

    // Fallback: Try multiple selectors to find the profile/user button
    const profileButton = 
      document.querySelector('[data-testid="profile-button"]') ||
      document.querySelector('[data-testid="user-menu"]') ||
      document.querySelector('[data-testid="user-button"]') ||
      document.querySelector('button[aria-label*="Profile"]') ||
      document.querySelector('button[aria-label*="User"]') ||
      document.querySelector('button[aria-label*="Account"]') ||
      document.querySelector('nav button:last-child') ||
      document.querySelector('header button:last-child');
    
    console.log('Profile button found:', profileButton);
    
    if (profileButton) {
      console.log('Creating button group...');
      this.isInitialized = true;
      this.observer.disconnect();
      this.createButtonGroup(profileButton);
      setTimeout(() => {
        this.observer.observe(document.body, { childList: true, subtree: true });
      }, 100);
    } else {
      // Fallback: Try to inject into common header/nav locations
      const fallbackContainer = 
        document.querySelector('nav') ||
        document.querySelector('header') ||
        document.querySelector('[role="banner"]') ||
        document.querySelector('main').parentElement;
      
      if (fallbackContainer) {
        console.log('Using fallback container:', fallbackContainer);
        this.isInitialized = true;
        this.observer.disconnect();
        this.createButtonGroupFallback();
        setTimeout(() => {
          this.observer.observe(document.body, { childList: true, subtree: true });
        }, 100);
      }
    }
  }

  createButtonGroupInHeader(headerActions, shareButton) {
    try {
      // Create container for the button group
      const buttonGroupContainer = document.createElement("div");
      buttonGroupContainer.className = "pdf-saver-container flex items-center gap-1";
      buttonGroupContainer.id = "saveToPdf-button-group";
      buttonGroupContainer.setAttribute('data-pdf-saver', 'true');

      // Create main save button with modern styling
      const saveButton = document.createElement("button");
      saveButton.id = "saveToPdf-button";
      saveButton.className = "pdf-save-btn btn relative btn-ghost text-token-text-primary group transition-all duration-200";
      saveButton.setAttribute("aria-label", "Save conversation as PDF");
      saveButton.setAttribute("data-tooltip", "Save entire conversation to PDF");
      saveButton.innerHTML = `
        <div class="flex w-full items-center justify-center gap-1.5 px-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon transition-transform group-hover:scale-105">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="currentColor"/>
            <path d="M8,12H16V14H8V12M8,16H13V18H8V16Z" fill="currentColor" opacity="0.7"/>
          </svg>
          <span class="hidden sm:inline text-sm font-medium">PDF</span>
        </div>
      `;
      saveButton.onclick = this.handleSaveClick.bind(this);

      // Create dropdown button with modern styling
      const dropdownButton = document.createElement("button");
      dropdownButton.id = "saveToPdf-dropdown-toggle";
      dropdownButton.className = "pdf-options-btn btn relative btn-ghost text-token-text-primary group transition-all duration-200";
      dropdownButton.setAttribute("aria-label", "PDF export options");
      dropdownButton.setAttribute("data-tooltip", "More export options");
      dropdownButton.innerHTML = `
        <div class="flex w-full items-center justify-center p-1">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-sm transition-transform group-hover:rotate-180 duration-200">
            <path d="M12.1338 5.94433C12.3919 5.77382 12.7434 5.80202 12.9707 6.02929C13.1979 6.25656 13.2261 6.60807 13.0556 6.8662L12.9707 6.9707L8.47067 11.4707C8.21097 11.7304 7.78896 11.7304 7.52926 11.4707L3.02926 6.9707L2.9443 6.8662C2.77379 6.60807 2.80199 6.25656 3.02926 6.02929C3.25653 5.80202 3.60804 5.77382 3.86617 5.94433L3.97067 6.02929L7.99996 10.0586L12.0293 6.02929L12.1338 5.94433Z"></path>
          </svg>
        </div>
      `;

      // Create modern dropdown menu
      const dropdownMenu = this.createModernDropdownMenu();
      this.setupDropdownBehavior(dropdownButton, dropdownMenu);

      // Create modern cancel button (initially hidden)
      const cancelButton = document.createElement("button");
      cancelButton.id = "saveToPdf-cancel-button";
      cancelButton.className = "pdf-cancel-btn btn relative btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50 hidden transition-all duration-200";
      cancelButton.setAttribute("aria-label", "Cancel message selection");
      cancelButton.setAttribute("data-tooltip", "Cancel selection mode");
      cancelButton.innerHTML = `
        <div class="flex w-full items-center justify-center p-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-sm">
            <path d="M12.8536 4.35355C13.0488 4.15829 13.0488 3.84171 12.8536 3.64645C12.6583 3.45118 12.3417 3.45118 12.1464 3.64645L8 7.79289L3.85355 3.64645C3.65829 3.45118 3.34171 3.45118 3.14645 3.64645C2.95118 3.84171 2.95118 4.15829 3.14645 4.35355L7.29289 8L3.14645 11.6464C2.95118 11.8417 2.95118 12.1583 3.14645 12.3536C3.34171 12.5488 3.65829 12.5488 3.85355 12.3536L8 8.20711L12.1464 12.3536C12.3417 12.5488 12.6583 12.5488 12.8536 12.3536C13.0488 12.1583 13.0488 11.8417 12.8536 11.6464L8.70711 8L12.8536 4.35355Z"/>
          </svg>
        </div>
      `;
      cancelButton.onclick = this.handleCancelClick.bind(this);

      // Set up container with relative positioning for dropdown
      buttonGroupContainer.style.position = "relative";
      buttonGroupContainer.appendChild(saveButton);
      buttonGroupContainer.appendChild(dropdownButton);
      buttonGroupContainer.appendChild(dropdownMenu);
      buttonGroupContainer.appendChild(cancelButton);

      // Add loading indicator
      const loadingIndicator = this.createLoadingIndicator();
      buttonGroupContainer.appendChild(loadingIndicator);

      headerActions.insertBefore(buttonGroupContainer, shareButton);

      // Store references
      this.saveButton = saveButton;
      this.dropdownButton = dropdownButton;
      this.dropdownMenu = dropdownMenu;
      this.cancelButton = cancelButton;
      this.loadingIndicator = loadingIndicator;
      
      // Add tooltips
      this.addTooltips();
      
    } catch (error) {
      console.error('Failed to create PDF saver buttons:', error);
      this.showErrorNotification('Failed to initialize PDF export feature');
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
      "btn btn-secondary hidden",
      this.cancelSelectMode.bind(this)
    );

    const dropdownMenu = this.createDropdownMenu();

    buttonGroupContainer.appendChild(saveButton);
    buttonGroupContainer.appendChild(dropdownButton);
    buttonGroupContainer.appendChild(dropdownMenu);
    buttonGroupContainer.appendChild(cancelButton);

    profileButton.parentNode.insertBefore(buttonGroupContainer, profileButton);

    this.saveButton = saveButton;
    this.cancelButton = cancelButton;
    this.dropdownButton = dropdownButton;
    this.dropdownMenu = dropdownMenu;
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

  createButtonGroupFallback() {
    const buttonGroupContainer = document.createElement("div");
    buttonGroupContainer.className = "saveToPdf-button-group";
    buttonGroupContainer.id = "saveToPdf-button-group";
    buttonGroupContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 4px;
    `;

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
      "btn btn-secondary hidden",
      this.cancelSelectMode.bind(this)
    );

    const dropdownMenu = this.createDropdownMenu();

    buttonGroupContainer.appendChild(saveButton);
    buttonGroupContainer.appendChild(dropdownButton);
    buttonGroupContainer.appendChild(dropdownMenu);
    buttonGroupContainer.appendChild(cancelButton);

    document.body.appendChild(buttonGroupContainer);

    this.saveButton = saveButton;
    this.cancelButton = cancelButton;
    this.dropdownButton = dropdownButton;
    this.dropdownMenu = dropdownMenu;
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

  createModernDropdownMenu() {
    const menu = document.createElement("div");
    menu.className = "pdf-dropdown-menu hidden absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48";
    menu.id = "saveToPdf-dropdown-menu";
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      z-index: 1000;
      min-width: 200px;
      font-family: inherit;
    `;

    const options = [
      {
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/></svg>`,
        text: "Select Messages",
        description: "Choose specific messages to export",
        action: this.onSelectMessagesClick.bind(this)
      },
      {
        icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>`,
        text: "Export All",
        description: "Export entire conversation",
        action: this.handleSaveClick.bind(this)
      }
    ];

    options.forEach((option, index) => {
      const item = document.createElement("div");
      item.className = "pdf-menu-item flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150";
      if (index > 0) item.style.borderTop = "1px solid #f3f4f6";
      
      item.innerHTML = `
        <div class="flex-shrink-0 text-gray-500">${option.icon}</div>
        <div class="flex-1">
          <div class="text-sm font-medium text-gray-900">${option.text}</div>
          <div class="text-xs text-gray-500">${option.description}</div>
        </div>
      `;
      
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideDropdown();
        option.action();
      });
      
      menu.appendChild(item);
    });

    return menu;
  }

  createLoadingIndicator() {
    const loader = document.createElement("div");
    loader.className = "pdf-loading-indicator hidden absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded";
    loader.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
    return loader;
  }

  setupDropdownBehavior(dropdownButton, dropdownMenu) {
    dropdownButton.onclick = (e) => {
      e.stopPropagation();
      const isHidden = dropdownMenu.classList.contains("hidden");
      this.hideDropdown(); // Close any open dropdowns
      if (isHidden) {
        dropdownMenu.classList.remove("hidden");
        this.setupOutsideClickHandler(dropdownMenu);
      }
    };
  }

  setupOutsideClickHandler(dropdownMenu) {
    const handleOutsideClick = (e) => {
      if (!dropdownMenu.contains(e.target) && !e.target.closest('#saveToPdf-dropdown-toggle')) {
        this.hideDropdown();
        document.removeEventListener('click', handleOutsideClick);
      }
    };
    
    // Add small delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
  }

  hideDropdown() {
    const menu = this.dropdownMenu || document.querySelector('#saveToPdf-dropdown-menu');
    if (menu) {
      menu.classList.add("hidden");
    }
  }

  addTooltips() {
    const buttons = document.querySelectorAll('[data-tooltip]');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', this.showTooltip.bind(this));
      button.addEventListener('mouseleave', this.hideTooltip.bind(this));
    });
  }

  showTooltip(e) {
    const text = e.target.closest('[data-tooltip]')?.getAttribute('data-tooltip');
    if (!text) return;

    const tooltip = document.createElement('div');
    tooltip.className = 'pdf-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #374151;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1001;
      margin-bottom: 4px;
    `;
    
    e.target.closest('button').style.position = 'relative';
    e.target.closest('button').appendChild(tooltip);
  }

  hideTooltip(e) {
    const tooltip = e.target.closest('button')?.querySelector('.pdf-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }

  onSaveClick() {
    const selectedMessages = document.querySelectorAll(".selected-message");
    if (selectedMessages.length > 0) {
      this.saveMessages(selectedMessages);
    } else {
      this.saveAllMessages();
    }
  }

  async handleSaveClick() {
    try {
      this.showLoading(true);
      const selectedMessages = document.querySelectorAll(".selected-message");
      
      if (selectedMessages.length > 0) {
        await this.saveMessages(selectedMessages);
        this.showSuccessNotification(`Exported ${selectedMessages.length} messages to PDF`);
      } else {
        await this.saveAllMessages();
        this.showSuccessNotification('Conversation exported to PDF successfully');
      }
    } catch (error) {
      console.error('PDF export failed:', error);
      this.showErrorNotification('Failed to export PDF. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  handleCancelClick() {
    try {
      this.cancelSelectMode();
      this.showNotification('Selection mode cancelled', 'info');
    } catch (error) {
      console.error('Failed to cancel selection:', error);
    }
  }

  async saveMessages(selectedMessages) {
    if (selectedMessages.length === 0) {
      this.showErrorNotification("No messages selected.");
      return;
    }

    try {
      const container = this.createPdfContainer(selectedMessages);
      if (!container || !container.hasChildNodes()) {
        throw new Error("No valid content found to export");
      }
      
      const filename = selectedMessages.length === 1 ? 
        "selected_message.pdf" : 
        `selected_messages_${selectedMessages.length}.pdf`;
        
      await this.generatePdf(container, filename);
      this.cancelSelectMode();
    } catch (error) {
      console.error('Failed to save selected messages:', error);
      throw new Error(`Failed to export ${selectedMessages.length} messages: ${error.message}`);
    }
  }

  async saveAllMessages() {
    try {
      const messages = this.getAllMessages();
      console.log('Found messages:', messages.length);
      
      if (messages.length === 0) {
        throw new Error("No conversation messages found to export");
      }
      
      // Create a more descriptive filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `chatgpt_conversation_${timestamp}.pdf`;
      
      const container = this.createPdfContainer(messages);
      if (!container || !container.hasChildNodes()) {
        throw new Error("No valid content found in conversation");
      }
      
      await this.generatePdf(container, filename);
    } catch (error) {
      console.error('Failed to save all messages:', error);
      throw new Error(`Failed to export conversation: ${error.message}`);
    }
  }

  getAllMessages() {
    // Try multiple selectors to find conversation messages
    let messages = document.querySelectorAll("[data-testid^='conversation-turn-']");
    
    if (messages.length === 0) {
      messages = document.querySelectorAll("[data-message-author-role]");
    }
    
    if (messages.length === 0) {
      messages = document.querySelectorAll(".group.w-full");
    }
    
    if (messages.length === 0) {
      messages = document.querySelectorAll("div[class*='group']");
    }
    
    if (messages.length === 0) {
      // Last resort: look for common chat message patterns
      messages = document.querySelectorAll("main div > div > div");
    }
    
    return messages;
  }

  async generatePdf(content, filename) {
    if (!content) {
      throw new Error("No content provided for PDF generation");
    }
    
    if (typeof html2pdf === 'undefined') {
      throw new Error("PDF library not loaded. Please refresh the page and try again.");
    }
    
    // Enhanced PDF options for better quality and compatibility
    const options = {
      margin: [20, 15, 20, 15], // top, right, bottom, left
      filename: this.sanitizeFilename(filename),
      pagebreak: { 
        mode: ["css", "avoid-all"],
        before: '.pdf-page-break',
        after: '.pdf-page-break-after'
      },
      image: { 
        type: "jpeg", 
        quality: 0.95,
        crossOrigin: 'anonymous'
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: "pt", 
        format: "a4", 
        orientation: "portrait",
        compress: true
      },
    };

    try {
      // Clone content to avoid modifying original DOM
      const clonedContent = content.cloneNode(true);
      this.preparePdfContent(clonedContent);
      
      await html2pdf().set(options).from(clonedContent).save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      throw new Error(`PDF generation failed: ${error.message || 'Unknown error'}`);
    }
  }

  sanitizeFilename(filename) {
    // Remove or replace invalid filename characters
    return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
  }

  preparePdfContent(content) {
    // Remove elements that shouldn't be in PDF
    const elementsToRemove = content.querySelectorAll('button, .pdf-saver-container, [data-pdf-saver]');
    elementsToRemove.forEach(el => el.remove());
    
    // Add PDF-specific styling
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .pdf-page-break { page-break-before: always; }
      .pdf-page-break-after { page-break-after: always; }
      img { max-width: 100%; height: auto; }
      pre { white-space: pre-wrap; word-wrap: break-word; }
      code { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; }
    `;
    content.insertBefore(style, content.firstChild);
    
    return content;
  }

  createPdfContainer(messages) {
    let pdfContainer;

    if (messages.length === 1) {
      pdfContainer = messages[0].querySelector(
        '[data-message-author-role="assistant"]'
      );
    } else {
      pdfContainer = document.createElement("div");
      messages.forEach((msg, index) => {
        const cloned = msg.cloneNode(true);
        pdfContainer.appendChild(cloned);
        if (index < messages.length - 1) {
          const divider = document.createElement("div");
          divider.style.borderTop = "1px solid #ccc";
          divider.style.margin = "10px 0";
          pdfContainer.appendChild(divider);
        }
      });
    }
    return pdfContainer;
  }

  onSelectMessagesClick() {
    const messages = this.getAllMessages();
    console.log('Enabling selection for', messages.length, 'messages');
    messages.forEach((msg) => {
      msg.classList.add("selectable-message");
      msg.addEventListener("click", this.toggleMessageSelection);
    });

    this.saveButton.textContent = "Save 0 Selected Messages";
    this.dropdownButton.classList.add("hidden");
    this.dropdownMenu.classList.add("hidden");
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
    const messages = this.getAllMessages();
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

  showLoading(show = true) {
    if (this.loadingIndicator) {
      this.loadingIndicator.classList.toggle('hidden', !show);
    }
    
    // Disable buttons during loading
    if (this.saveButton) {
      this.saveButton.disabled = show;
      this.saveButton.style.opacity = show ? '0.6' : '1';
    }
    if (this.dropdownButton) {
      this.dropdownButton.disabled = show;
      this.dropdownButton.style.opacity = show ? '0.6' : '1';
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `pdf-notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`;
    
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    
    notification.className += ` ${colors[type] || colors.success} border`;
    
    const icons = {
      success: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      info: `<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };
    
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">${icons[type] || icons.success}</div>
        <p class="text-sm font-medium">${message}</p>
        <button class="ml-auto flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  showSuccessNotification(message) {
    this.showNotification(message, 'success');
  }

  showErrorNotification(message) {
    this.showNotification(message, 'error');
  }

  showInfoNotification(message) {
    this.showNotification(message, 'info');
  }
}

new PDFMessageSaver();
