// Observer to monitor DOM changes
const saveMessages = async (selectedMessages) => {
  if (selectedMessages.length === 0) {
    alert("No messages selected.");
    return;
  }

  let pdfContainer;

  if (selectedMessages.length === 1) {
    pdfContainer = selectedMessages[0].querySelector(
      '[data-message-author-role="assistant"]'
    );
  } else {
    pdfContainer = document.createElement("div");

    Array.from(selectedMessages).forEach((msg, index) => {
      // Clone the message and append it to the container
      const clonedMessage = msg.cloneNode(true);
      pdfContainer.appendChild(clonedMessage);

      // Add a divider between messages, except after the last one
      if (index < selectedMessages.length - 1) {
        const divider = document.createElement("div");
        divider.style.borderTop = "1px solid #ccc";
        divider.style.margin = "10px 0";
        pdfContainer.appendChild(divider);
      }
    });
  }

  const options = {
    margin: 40,
    filename: "selected_messages.pdf",
    pagebreak: { mode: ["css", "avoid-all"] },
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
  };

  try {
    await html2pdf().set(options).from(pdfContainer).save();
  } catch (error) {
    console.error(error);
    alert("Failed to save PDF.");
  } finally {
    cancelSelectMode();
  }
};

const saveAllMessages = async () => {
  const messages = document.querySelectorAll(
    "[data-testid^='conversation-turn-']"
  );

  await saveMessages(messages);
};

const cancelSelectMode = () => {
  const messages = document.querySelectorAll(
    "[data-testid^='conversation-turn-']"
  );
  messages.forEach((message) => {
    message.classList.remove("selectable-message", "selected-message");
    message.replaceWith(message.cloneNode(true));
  });

  const saveToPdfButton = document.querySelector("#saveToPdf-button");
  const cancelButton = document.querySelector("#saveToPdf-cancel-button");
  const dropdownToggleButton = document.querySelector(
    "#saveToPdf-dropdown-toggle"
  );

  // Reset button states
  saveToPdfButton.textContent = "Save to PDF";
  cancelButton.replaceWith(dropdownToggleButton);
};

const observer = new MutationObserver((mutationsList, observer) => {
  const profileButton = document.querySelector(
    '[data-testid="profile-button"]'
  );

  const saveToPdfButton = document.querySelector("#saveToPdf-button");

  if (profileButton && !saveToPdfButton) {
    // Create the button group container
    const buttonGroupContainer = document.createElement("div");
    buttonGroupContainer.className = "saveToPdf-button-group";

    // Create the "Save to PDF" button
    const saveToPdfButton = document.createElement("button");
    saveToPdfButton.id = "saveToPdf-button";
    saveToPdfButton.type = "button";
    saveToPdfButton.textContent = "Save to PDF";
    saveToPdfButton.className = "btn btn-primary";

    // Save to PDF button functionality
    saveToPdfButton.onclick = async () => {
      const selectedMessages = document.querySelectorAll(".selected-message");
      if (selectedMessages.length > 0) {
        await saveMessages(selectedMessages);
      } else {
        await saveAllMessages();
      }
    };
    // Create the dropdown toggle button
    const dropdownToggleButton = document.createElement("button");
    dropdownToggleButton.id = "saveToPdf-dropdown-toggle";
    dropdownToggleButton.type = "button";
    dropdownToggleButton.textContent = "▼";
    dropdownToggleButton.className = "btn btn-secondary dropdown-toggle";

    //create a cancel button
    const cancelButton = document.createElement("button");
    cancelButton.id = "saveToPdf-cancel-button";
    cancelButton.type = "button";
    cancelButton.textContent = "X";
    cancelButton.className = "btn btn-secondary";

    // Create the dropdown menu
    const dropdownMenu = document.createElement("ul");
    dropdownMenu.id = "saveToPdf-dropdown-menu";
    dropdownMenu.className = "dropdown-menu hidden";

    const selectMessagesOption = document.createElement("li");
    selectMessagesOption.textContent = "Select Messages";
    selectMessagesOption.addEventListener("click", () => {
      dropdownMenu.classList.add("hidden");

      const messages = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
      );
      messages.forEach((message) => {
        message.classList.add("selectable-message");
        message.addEventListener("click", function toggleSelection() {
          message.classList.toggle("selected-message");

          const selectedMessages =
            document.querySelectorAll(".selected-message");
          saveToPdfButton.textContent = `Save ${selectedMessages.length} Selected Messages`;
        });
      });

      // Update "Save to PDF" button functionality for selected messages
      saveToPdfButton.textContent = `Save 0 Selected Messages`;

      // Cancel button functionality
      dropdownToggleButton.replaceWith(cancelButton);
      cancelButton.onclick = cancelSelectMode;
    });

    dropdownMenu.appendChild(selectMessagesOption);

    dropdownToggleButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });

    // Append buttons and menu to the container
    buttonGroupContainer.appendChild(saveToPdfButton);
    buttonGroupContainer.appendChild(dropdownToggleButton);
    buttonGroupContainer.appendChild(dropdownMenu);

    // Inject the button group into the DOM
    profileButton.parentNode.insertBefore(buttonGroupContainer, profileButton);
  }
});

// Start observing the body for DOM changes
observer.observe(document.body, { childList: true, subtree: true });
