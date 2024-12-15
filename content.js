// Observer to monitor DOM changes
const observer = new MutationObserver((mutationsList, observer) => {
  const profileButton = document.querySelector(
    '[data-testid="profile-button"]'
  );

  if (profileButton) {
    // Stop observing once the target button is found
    observer.disconnect();

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
    saveToPdfButton.addEventListener("click", () => {
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
    });

    // Create the dropdown toggle button
    const dropdownToggleButton = document.createElement("button");
    dropdownToggleButton.id = "saveToPdf-dropdown-toggle";
    dropdownToggleButton.type = "button";
    dropdownToggleButton.textContent = "▼";
    dropdownToggleButton.className = "btn btn-secondary dropdown-toggle";

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
        });
      });

      // Update "Save to PDF" button functionality for selected messages
      saveToPdfButton.textContent = "Save Selected to PDF";
      saveToPdfButton.onclick = async () => {
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
        } catch (error) {
          alert("Failed to save PDF.");
        }
      };
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
