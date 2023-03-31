document.addEventListener('DOMContentLoaded', () => {
    const latexInput = document.getElementById('latexInput');
    const convertBtn = document.getElementById('convertBtn');
    const mathmlOutput = document.getElementById('mathmlOutput');
    const editBtn = document.getElementById('editBtn');
    const copyBtn = document.getElementById('copyBtn');
  
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
  
    editBtn.addEventListener('click', () => {
      if (mathmlOutput.readOnly) {
        mathmlOutput.readOnly = false;
        editBtn.textContent = 'Disable Editing';
      } else {
        mathmlOutput.readOnly = true;
        editBtn.textContent = 'Edit Output';
      }
    });
  
    copyBtn.addEventListener('click', () => {
      mathmlOutput.select();
      document.execCommand('copy');
      alert('MathML code copied to clipboard.');
    });
  });
  
  function sanitizeInput(input) {
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  
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
  