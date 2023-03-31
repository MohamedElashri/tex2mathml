document.addEventListener('DOMContentLoaded', () => {
  const latexInput = document.getElementById('latexInput');
  const convertBtn = document.getElementById('convertBtn');
  const mathmlOutput = document.getElementById('mathmlOutput');
  const editBtn = document.getElementById('editBtn');
  const copyBtn = document.getElementById('copyBtn');


  copyBtn.addEventListener('click', () => {
    mathmlOutput.select();
    document.execCommand('copy');
    alert('MathML code copied to clipboard.');
  });

  convertBtn.addEventListener('click', async () => {
    const latex = latexInput.value;

    if (!latex) {
      alert('Please enter a LaTeX expression to convert.');
      return;
    }

    try {
      const mathml = await getMathML(latex);
      mathmlOutput.value = mathml;
    } catch (error) {
      console.error('Error converting LaTeX to MathML:', error);
      alert('An error occurred while converting LaTeX to MathML. Please check your input and try again.');
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
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
      output: 'mathml',
    };

    MathJax.texReset();
    const output = await MathJax.tex2mmlPromise(sanitizedInput, mathJaxConfig);
    const mathml = output.replace(/ xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML"/g, '');
    return mathml;
  }
});
