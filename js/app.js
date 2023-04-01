document.addEventListener("DOMContentLoaded", () => {
  /*
     This code creates a new instance of CodeMirror
     The instance is stored in the variable editor
     and it is created by calling the function CodeMirror.fromTextArea
     The function CodeMirror.fromTextArea takes a single argument:
     document.getElementById("latexInput")
     The function document.getElementById takes a single argument:
    "latexInput"
     The argument "latexInput" is the ID of the textarea element
     The element with the ID "latexInput" is the textarea element
     The textarea element is where the user enters their LaTeX code
     The textarea element is defined in the HTML file
     The textarea element is passed as the argument to the function CodeMirror.fromTextArea
     The function CodeMirror.fromTextArea returns a new instance of CodeMirror
     The new instance of CodeMirror is stored in the variable editor
     The variable editor is used to access the functionality of the new instance of CodeMirror
    */
  const editor = CodeMirror.fromTextArea(document.getElementById("latexInput"), {
    mode: "stex",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: "material-darker",
  });

  /*
  The following code do the following:
  - Set up the CodeMirror input editor
  - Initialize the input editor to be a CodeMirror editor
  - Set the mode to be "mathml"
  - Set the theme to be "material-darker"
  - Set the line numbers to be true
  - Set the editor to be read only
  */
  const outputEditor = CodeMirror.fromTextArea(document.getElementById("mathmlOutput"), {
    mode: "xml",
    lineNumbers: true,
    readOnly: true,
    theme: "material-darker",
  });

  // Get the convert and copy buttons from the HTML
  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");

  // Add event listener to convert button to call getMathML function
  convertBtn.addEventListener("click", async () => {
    const latex = editor.getValue().trim();

    if (!latex) {
      alert("Please enter a LaTeX expression to convert.");
      return;
    }

    try {
      const mathml = await getMathML(latex);
      outputEditor.setValue(mathml);
    } catch (error) {
      console.error("Error converting LaTeX to MathML:", error);
      alert(
        "An error occurred while converting LaTeX to MathML. Please check your input and try again."
      );
    }
  });

  /*
  Funtion to sanitize user input to prevent XSS attacks.
  Objective: 
  - The objective of the sanitizeInput function is to sanitize the input string by 
    replacing all occurrences of '<' and '>' characters with their 
    corresponding HTML entities '&lt;' and '&gt;'. 
    This is done to prevent potential security vulnerabilities such 
    as cross-site scripting (XSS) attacks.
  Input: 
  - input: a string representing the input to be sanitized.
  Flow:
  - The function takes the input string as a parameter.
  - The function uses the replace() method to replace all occurrences of '<' and '>' characters with their corresponding HTML entities '&lt;' and '&gt;'.
  - The sanitized input string is returned as the output of the function.
  Output:
  - A sanitized version of the input string with all '<' and '>' characters 
    replaced with their corresponding HTML entities '&lt;' and '&gt;'.
  Additional Notes:
  - The sanitizeInput function is called within the getMathML function to sanitize the 
    input LaTeX string before passing it to the MathJax library for conversion to MathML.
  - Sanitizing input is an important security practice to prevent 
    potential security vulnerabilities such as XSS attacks.
  */
  function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /*
  Function to convert the input string (LaTex) to MathML.
  Objective:
  - The objective of the getMathML function is to convert a LaTeX expression to MathML 
    format using the MathJax library. The function also calls the sanitizeInput 
    function to sanitize the input LaTeX string to prevent potential security 
    vulnerabilities such as cross-site scripting (XSS) attacks.
  Inputs:
  - latex: a string representing the LaTeX expression to be converted to MathML format.
  Flow:
  - The function takes the input LaTeX string as a parameter.
  - The function calls the sanitizeInput function to sanitize the input LaTeX string.
  - The function sets the MathJax configuration options for the conversion process.
  - The function resets the MathJax state to ensure a clean conversion process.
  - The function uses the MathJax tex2mmlPromise method to convert the sanitized 
    LaTeX string to MathML format.
  - The function removes the MathML namespace from the output string.
  - The function returns the MathML output string.
  Output:
  - A string representing the MathML output of the LaTeX expression conversion.
  Additional Notes:
  - The getMathML function uses the MathJax library for the LaTeX to MathML conversion process.
  - The function calls the sanitizeInput function to sanitize the input LaTeX string 
    to prevent potential security vulnerabilities such as XSS attacks.
  - The function removes the MathML namespace from the output string to ensure 
    compatibility with different browsers.
  */

  async function getMathML(latex) {
    const sanitizedInput = sanitizeInput(latex);

    const mathJaxConfig = {
      display: false,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
      lineWidth: 1000,
      scale: 1,
    };

    MathJax.texReset();
    const output = await MathJax.tex2mmlPromise(sanitizedInput, mathJaxConfig);
    const mathml = output.replace(
      / xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML"/g,
      ""
    );
    return mathml;
  }

  /*
  The following code do the following:
  - Selects the MathML code and copies it to the clipboard.
  - Alerts the user that the code has been copied to the clipboard.
  - The code is used when the "Copy" button is clicked.
  - The "copyBtn" variable is the "Copy" button.
  - The "mathmlOutput" variable is the div that contains the MathML code.
  */
  copyBtn.addEventListener("click", () => {
    const range = document.createRange();
    range.selectNode(document.getElementById("mathmlOutput"));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    alert("MathML code copied to clipboard.");
  });
});
