document.addEventListener("DOMContentLoaded", () => {
  const editor = CodeMirror.fromTextArea(document.getElementById("latexInput"), {
    mode: "stex",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: "material-darker",
  });

  const outputEditor = CodeMirror.fromTextArea(document.getElementById("mathmlOutput"), {
    mode: "xml",
    lineNumbers: true,
    readOnly: true,
    theme: "material-darker",
  });

  const convertBtn = document.getElementById("convertBtn");
  const copyBtn = document.getElementById("copyBtn");

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

  function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    };

    MathJax.texReset();
    const output = await MathJax.tex2mmlPromise(sanitizedInput, mathJaxConfig);
    const mathml = output.replace(
      / xmlns="http:\/\/www.w3.org\/1998\/Math\/MathML"/g,
      ""
    );
    return mathml;
  }

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
