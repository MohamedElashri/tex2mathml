document.addEventListener("DOMContentLoaded", () => {
  // Get the textarea elements directly - no CodeMirror needed
  const latexInput = document.getElementById("latexInput");
  const mathmlOutput = document.getElementById("mathmlOutput");
  
  // Simple editor interface to maintain compatibility
  const editor = {
    getValue: () => latexInput.value,
    setValue: (val) => { latexInput.value = val; },
    on: (event, callback) => {
      if (event === "change") {
        latexInput.addEventListener("input", callback);
      }
    }
  };
  
  const outputEditor = {
    getValue: () => mathmlOutput.value,
    setValue: (val) => { mathmlOutput.value = val; },
    getWrapperElement: () => mathmlOutput
  };

  // Get the copy button from the HTML
  const copyBtn = document.getElementById("copyBtn");
  const mathPreview = document.getElementById("mathPreview");
  const outputModeSelect = document.getElementById("outputMode");
  
  // Store the current MathML and LaTeX
  let currentMathML = "";
  let currentLatex = "";
  
  // Debounce timer for auto-conversion
  let conversionTimer = null;
  
  // Function to perform conversion
  function performConversion() {
    const latex = editor.getValue().trim();
    
    if (!latex) {
      // Clear output if input is empty
      currentMathML = "";
      currentLatex = "";
      mathPreview.innerHTML = "";
      outputEditor.setValue("");
      return;
    }

    try {
      const mathml = getMathML(latex);
      currentMathML = mathml;
      currentLatex = latex;
      
      // Update display based on selected mode
      updateDisplay(getSelectedMode());
    } catch (error) {
      console.error("Error converting LaTeX to MathML:", error);
      // Show error in preview
      mathPreview.innerHTML = '<span style="color: #ff6b6b;">Error: ' + error.message + '</span>';
      mathPreview.classList.add('active');
      outputEditor.getWrapperElement().style.display = 'none';
    }
  }
  
  // Add auto-conversion on input change with debounce
  editor.on("change", () => {
    // Clear previous timer
    if (conversionTimer) {
      clearTimeout(conversionTimer);
    }
    
    // Set new timer for 500ms delay
    conversionTimer = setTimeout(() => {
      performConversion();
    }, 500);
  });
  
  // Perform initial conversion if there's default content
  if (editor.getValue().trim()) {
    performConversion();
  }
  
  // Function to format MathML with proper indentation (inspired by tex repo)
  function formatMathML(mathml) {
    try {
      // Basic formatting with proper indentation
      let formatted = mathml;
      let indent = 0;
      const lines = [];
      
      // Simple tag-based formatting
      formatted = formatted.replace(/></g, '>\n<');
      const parts = formatted.split('\n');
      
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        
        // Decrease indent for closing tags
        if (trimmed.startsWith('</')) {
          indent = Math.max(0, indent - 1);
        }
        
        // Add the line with proper indentation
        lines.push('  '.repeat(indent) + trimmed);
        
        // Increase indent for opening tags (but not self-closing)
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          // Check if it's not immediately closed on the same line
          const tagName = trimmed.match(/<(\w+)/);
          if (tagName && !trimmed.includes('</' + tagName[1] + '>')) {
            indent++;
          }
        }
      });
      
      return lines.join('\n');
    } catch (e) {
      return mathml;
    }
  }
  
  // Function to flatten MathML (remove all whitespace and newlines)
  function flattenMathML(mathml) {
    return mathml.replace(/>\s+</g, '><').replace(/\n/g, '').trim();
  }
  
  // Function to update display based on selected mode
  function updateDisplay(mode) {
    if (!currentMathML) return;
    
    // Hide/show appropriate containers
    const outputTextarea = outputEditor.getWrapperElement();
    
    switch(mode) {
      case 'math':
        // Show rendered math, hide textarea
        mathPreview.classList.add('active');
        outputTextarea.style.display = 'none';
        
        // Use Temml to render directly to the preview (like tex repo)
        mathPreview.innerHTML = '';
        try {
          temml.render(currentLatex, mathPreview, {
            displayMode: true,
            trust: true
          });
          // Post-process for proper display
          if (temml.postProcess) {
            temml.postProcess(mathPreview);
          }
        } catch (err) {
          console.error('Temml render error:', err);
          mathPreview.innerHTML = '<span style="color: #ff6b6b;">Error rendering math: ' + err.message + '</span>';
        }
        break;
        
      case 'mathml':
        // Show formatted MathML in textarea
        mathPreview.classList.remove('active');
        outputTextarea.style.display = 'block';
        outputEditor.setValue(formatMathML(currentMathML));
        break;
        
      case 'flat':
        // Show flat MathML in textarea
        mathPreview.classList.remove('active');
        outputTextarea.style.display = 'block';
        outputEditor.setValue(flattenMathML(currentMathML));
        break;
    }
  }
  
  // Add event listener to dropdown
  outputModeSelect.addEventListener('change', (e) => {
    updateDisplay(e.target.value);
  });
  
  // Get currently selected display mode
  function getSelectedMode() {
    return outputModeSelect.value;
  }

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

    function getMathML(latex) {
    // Don't sanitize input for Temml - it handles LaTeX safely
    // and sanitization breaks LaTeX commands
    
    // Ensure Temml is loaded
    if (typeof temml === 'undefined') {
      throw new Error('Temml library is not loaded');
    }

    // Use Temml to convert LaTeX to MathML
    const mathml = temml.renderToString(latex, {
      displayMode: true,
      trust: true
    });
    
    return mathml;
  }

  /*
  The following code copies the appropriate content based on display mode to clipboard.
  Uses the modern Clipboard API and gets the value based on current mode.
  */
  copyBtn.addEventListener("click", async () => {
    const mode = getSelectedMode();
    let contentToCopy = "";
    
    // Determine what to copy based on mode
    switch(mode) {
      case 'math':
        // Copy the LaTeX code for Math mode
        contentToCopy = currentLatex;
        break;
      case 'mathml':
      case 'flat':
        // Copy the MathML code from editor
        contentToCopy = outputEditor.getValue();
        break;
    }
    
    if (!contentToCopy) {
      // Show brief tooltip feedback
      copyBtn.innerHTML = '<i class="fas fa-exclamation"></i>';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
      }, 1000);
      return;
    }

    try {
      // Use modern Clipboard API
      await navigator.clipboard.writeText(contentToCopy);
      
      // Visual feedback with icon change
      const originalIcon = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      copyBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalIcon;
        copyBtn.style.background = '';
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show error icon briefly
      copyBtn.innerHTML = '<i class="fas fa-times"></i>';
      copyBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="far fa-copy"></i>';
        copyBtn.style.background = '';
      }, 1500);
    }
  });

  // Theme toggle functionality
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Check for saved theme preference or default to dark
  const currentTheme = localStorage.getItem('theme') || 'dark';
  if (currentTheme === 'light') {
    body.classList.add('light-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
      // Switch to light theme
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', 'light');
    } else {
      // Switch to dark theme
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'dark');
    }
  });
});
