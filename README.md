# ChatGPT to PDF

**ChatGPT to PDF** is a free and open-source Chrome extension that allows you to save your ChatGPT and other chat conversations as PDF documents. With features like unlimited message selection and full conversation export, you can easily archive your chats without any premium costs or advertisements.

---

## Features

- **Save Full Conversations:** Export entire ChatGPT conversations as high-quality PDFs.
- **Selective Message Saving:** Choose specific messages to include in your PDF export.
- **Easy-to-Use Interface:** A simple button group appears within the ChatGPT interface for quick access.
- **Customizable PDF Output:** Generates PDFs with clean formatting and page breaks optimized for readability.
- **Open Source:** Fully transparent code with no hidden features, ads, or premium paywalls.

---

## Installation

### Manual Installation

1. **Clone or Download the Repository:**
   ```bash
   git clone https://github.com/yourusername/chatgpt-to-pdf.git
   ```

   or download the ZIP archive and extract it.

2. **Load the Extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right).
   - Click on **Load unpacked** and select the directory where you cloned or extracted the repository.

3. **Start Using the Extension:**
   - Navigate to [ChatGPT](https://chatgpt.com/) (or the site matching the host permissions).
   - The extension will automatically inject a button group near the profile button for PDF saving options.

---

## Usage

1. **Saving a Conversation:**
   - Click the **"Save to PDF"** button that appears near your profile button.
   - The extension will automatically detect and export the entire conversation as a PDF named `selected_messages.pdf` if no messages are selected.

2. **Selecting Specific Messages:**
   - Click the **dropdown toggle (▼)** to reveal additional options.
   - Select **"Select Messages"**. This will enable a mode where each message becomes clickable.
   - Click on individual messages to mark them for selection. The button text will update with the count of selected messages.
   - Click **"Save X Selected Messages"** to export only the chosen messages.
   - To cancel selection mode, click the **"X"** (cancel button).

3. **PDF Generation:**
   - The extension uses [html2pdf](https://github.com/eKoopmans/html2pdf.js) to convert HTML content to PDF with configurable options such as margins, image quality, and page breaks.

---

## Development

### File Structure

- **`content.js`**: Contains the main logic for detecting DOM changes, inserting the PDF save buttons, and handling user interactions.
- **`html2pdf.bundle.min.js`**: A bundled library used for converting HTML content to PDF.
- **`style.css`**: Custom styles for the extension's UI elements.
- **`manifest.json`**: Defines the extension's metadata, permissions, and file associations.

### Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and ensure code quality with proper comments and testing.
4. Submit a pull request describing your changes.

### Running Locally

If you want to modify or test the extension locally:

1. Clone the repository.
2. Make the necessary changes in your local environment.
3. Load the unpacked extension in Chrome via `chrome://extensions/`.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Acknowledgements

- **html2pdf.js**: Thanks to [eKoopmans](https://github.com/eKoopmans/html2pdf.js) for providing a robust solution for HTML-to-PDF conversion.
- **ChatGPT**: For inspiring the project and providing an engaging platform for conversation archiving.

---

Happy chatting and saving! If you have any questions or feedback, please open an issue or contact the maintainer.
