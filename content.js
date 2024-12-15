// Observer to monitor DOM changes
const observer = new MutationObserver((mutationsList, observer) => {
  const profileButton = document.querySelector(
    '[data-testid="profile-button"]'
  );

  if (profileButton) {
    // Stop observing once the target button is found
    observer.disconnect();

    // Create the container for the button and dropdown
    const dropdownContainer = document.createElement("div");
    dropdownContainer.style =
      "position: inherit; display: inline-block; margin-right: 8px;";

    // Create the main button
    const mainButton = document.createElement("button");
    mainButton.className = "btn relative btn-primary text-token-text-primary";
    mainButton.setAttribute("aria-label", "Download Conversation as PDF");
    mainButton.style =
      "padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;";
    mainButton.textContent = "Save as PDF";

    // Create the dropdown toggle button
    const dropdownToggle = document.createElement("button");
    dropdownToggle.className = "btn dropdown-toggle";
    dropdownToggle.style =
      "padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; margin-left: 5px;";
    dropdownToggle.textContent = "▼";

    // Create the dropdown menu
    const dropdownMenu = document.createElement("div");
    dropdownMenu.style = `
            display: none;
            position: absolute;
            background-color: white;
            min-width: 200px;
            box-shadow: 0px 8px 16px rgba(0,0,0,0.2);
            z-index: 1000;
        `;

    // Create the "Select Conversation" button inside the dropdown
    const selectConversationButton = document.createElement("button");
    selectConversationButton.className = "dropdown-item";
    selectConversationButton.textContent = "Select Conversation";
    selectConversationButton.style =
      "padding: 8px; width: 100%; text-align: left; border: none; background: none; cursor: pointer;";

    // Append the dropdown item to the dropdown menu
    dropdownMenu.appendChild(selectConversationButton);

    // Add click event for the dropdown toggle
    dropdownToggle.addEventListener("click", () => {
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    // Add click event for the "Select Conversation" button
    selectConversationButton.addEventListener("click", () => {
      const conversations = document.querySelectorAll(
        '[data-testid^="conversation-turn-"]'
      );

      if (!conversations || conversations.length === 0) {
        alert("No conversations found to select!");
        return;
      }

      // Highlight conversations for user selection
      conversations.forEach((conversation) => {
        conversation.style.border = "2px solid red";
        conversation.style.cursor = "pointer";

        conversation.addEventListener("click", function onSelect() {
          conversation.style.border = "2px solid green";
          conversation.style.cursor = "default";

          // Save selected conversation
          dropdownContainer.selectedConversation = conversation;

          // Remove event listeners and styles from other conversations
          conversations.forEach((conv) => {
            conv.removeEventListener("click", onSelect);
            if (conv === conversation) return;

            conv.style.border = "none";
            conv.style.cursor = "default";
          });

          // alert("Conversation selected! You can now download it as a PDF.");
        });
      });
    });

    // Add click event for the main button to download the selected conversation
    mainButton.addEventListener("click", async () => {
      const selectedConversation =
        dropdownContainer.selectedConversation.querySelector(
          '[data-message-author-role="assistant"]'
        );

      if (!selectedConversation) {
        alert("Please select a conversation first!");
        return;
      }

      // Use html2pdf.js to convert the conversation to PDF
      console.log("Generating PDF...");
      const options = {
        margin: 40,
        filename: "chatgpt_conversation.pdf",
        pagebreak: { mode: ["css", "avoid-all"] },
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      };

      // const options = {
      //   margin: 1,
      //   filename: "chatgpt_conversation.pdf",
      //   image: { type: "jpeg", quality: 0.98 },
      //   html2canvas: { scale: 2 },
      //   jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      // };

      try {
        await html2pdf().set(options).from(selectedConversation).save();
        console.log("PDF saved successfully.");
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF.");
      } finally {
        // Reset selected conversation
        dropdownContainer.selectedConversation.style.border = "none";
        dropdownContainer.selectedConversation = null;
      }
    });

    // Append the buttons and menu to the container
    dropdownContainer.appendChild(mainButton);
    dropdownContainer.appendChild(dropdownToggle);
    dropdownContainer.appendChild(dropdownMenu);

    // Insert the container on the left of the profile button
    profileButton.parentNode.insertBefore(dropdownContainer, profileButton);
    console.log("Custom dropdown button added successfully on the left.");
  }
});

// Start observing the body for DOM changes
observer.observe(document.body, { childList: true, subtree: true });
