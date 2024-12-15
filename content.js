const clearMessagesStyle = (messages) => {
  messages.forEach((message) => {
    message.classList.remove("selectable-message");
    message.classList.remove("selected-message");
    message.removeEventListener("click", function toggleSelection() {
      message.classList.toggle("selected-message");
    });
  });
};

const observer = new MutationObserver((mutationsList, observer) => {
  const profileButton = document.querySelector(
    '[data-testid="profile-button"]'
  );

  if (profileButton) {
    // Stop observing once the target button is found
    observer.disconnect();

    // Create the dropdown button
    const dropdownContainer = document.createElement("div");
    dropdownContainer.className = "saveToPdf-dropdown-container";

    const dropdownButton = document.createElement("button");
    dropdownButton.id = "saveToPdf-dropdown-button";
    dropdownButton.type = "button";
    dropdownButton.textContent = "Select Action";

    const dropdownMenu = document.createElement("ul");
    dropdownMenu.id = "saveToPdf-dropdown-menu";
    dropdownMenu.className = "dropdown-menu hidden";

    const selectMessagesOption = document.createElement("li");
    selectMessagesOption.textContent = "Select Messages";
    selectMessagesOption.addEventListener("click", () => {
      alert("Click on messages to select them.");
      dropdownMenu.classList.add("hidden");

      const messages = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
      );
      messages.forEach((message) => {
        message.classList.add("selectable-message");
        message.addEventListener("click", function toggleSelection() {
          message.classList.toggle("selected-message");
        });
      });

      // Update the button text
      dropdownButton.textContent = "Save as PDF";
      dropdownButton.addEventListener("click", async () => {
        const selectedMessages = document.querySelectorAll(".selected-message");
        if (selectedMessages.length === 0) {
          alert("No messages selected.");
          return;
        }

        const pdfContent = Array.from(selectedMessages)
          .map((msg) => msg.innerText)
          .join("\n\n");

        const options = {
          margin: 40,
          filename: "selected_messages.pdf",
          pagebreak: { mode: ["css", "avoid-all"] },
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
        };

        try {
          await html2pdf().set(options).from(`<pre>${pdfContent}</pre>`).save();
          alert("PDF saved successfully.");
        } catch (error) {
          alert("Failed to save PDF.");
        } finally {
          // Remove the selectable message class
          clearMessagesStyle(messages);
          dropdownButton.textContent = "Select Action";
        }
      });
    });

    const saveAllMessagesOption = document.createElement("li");
    saveAllMessagesOption.textContent = "Save All Messages";
    saveAllMessagesOption.addEventListener("click", () => {
      alert("Saving all messages as PDF...");
      dropdownMenu.classList.add("hidden");

      const messages = document.querySelectorAll(
        "[data-testid^='conversation-turn-']"
      );
      const pdfContent = Array.from(messages)
        .map((msg) => msg.innerText)
        .join("\n\n");

      const options = {
        margin: 40,
        filename: "all_messages.pdf",
        pagebreak: { mode: ["css", "avoid-all"] },
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      };

      html2pdf().set(options).from(`<pre>${pdfContent}</pre>`).save();

      // Remove the selectable message class
      clearMessagesStyle(messages);
    });

    dropdownMenu.appendChild(selectMessagesOption);
    dropdownMenu.appendChild(saveAllMessagesOption);

    dropdownButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });

    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownMenu);

    profileButton.parentNode.insertBefore(dropdownContainer, profileButton);
  }
});

// Start observing the body for DOM changes
observer.observe(document.body, { childList: true, subtree: true });
