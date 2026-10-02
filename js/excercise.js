(function(){
  "use strict";

  window.CPLW = window.CPLW || {};
  var exercises = window.CPLW.exercises || [];

  var currentExercise = exercises[0];
  var codeInput = document.getElementById("codeInput");
  var codeHighlight = document.getElementById("codeHighlight");
  var outputArea = document.getElementById("outputArea");
  var feedbackArea = document.getElementById("feedbackArea");
  var expectedOutput = document.getElementById("expectedOutput");

  function escapeHtml(value){
    return value.replace(/[&<>\"]/g, function(character){
      return {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;"}[character];
    });
  }

  function updateHighlight(){
    var source = codeInput.value;
    var tokenPattern = /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:let|const|var|if|else|for|while|do|function|return|new|class|extends|this|throw|try|catch|finally|switch|case|break|continue|of|in|typeof|instanceof|async|await|import|export|from|default)\b|\b(?:true|false|null|undefined|NaN|Infinity)\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|[A-Za-z_$][\w$]*|[\s\S]/g;
    var token;
    var highlighted = "";

    while ((token = tokenPattern.exec(source)) !== null) {
      var value = token[0];
      var tokenClass = "";

      if (/^(?:\/\/|\/\*)/.test(value)) {
        tokenClass = "comment";
      } else if (/^["'`]/.test(value)) {
        tokenClass = "string";
      } else if (/^(?:let|const|var|if|else|for|while|do|function|return|new|class|extends|this|throw|try|catch|finally|switch|case|break|continue|of|in|typeof|instanceof|async|await|import|export|from|default)$/.test(value)) {
        tokenClass = "keyword";
      } else if (/^(?:true|false|null|undefined|NaN|Infinity)$/.test(value)) {
        tokenClass = "boolean";
      } else if (/^\d/.test(value)) {
        tokenClass = "number";
      } else if (/^[A-Za-z_$]/.test(value)) {
        tokenClass = /^\s*\(/.test(source.slice(tokenPattern.lastIndex)) ? "function" : "variable";
      }

      highlighted += tokenClass
        ? '<span class="syntax-' + tokenClass + '">' + escapeHtml(value) + '</span>'
        : escapeHtml(value);
    }

    codeHighlight.innerHTML = highlighted + (source.slice(-1) === "\n" ? " " : "");
  }

  function loadExercise(e){
    currentExercise = e;
    document.getElementById("exTitle").textContent = e.title;
    document.getElementById("exDesc").textContent = "Topic: " + e.topic + ". Write the code below to solve this exercise, then run it to check the output.";
    expectedOutput.textContent = e.expected;
    codeInput.value = e.code;
    updateHighlight();
    outputArea.textContent = "Run your code to see the output here.";
    feedbackArea.textContent = "";
    feedbackArea.className = "feedback";
  }
  window.CPLW.loadExercise = loadExercise;

  codeInput.addEventListener("input", updateHighlight);
  codeInput.addEventListener("scroll", function(){
    codeHighlight.style.transform = "translate(" + -codeInput.scrollLeft + "px, " + -codeInput.scrollTop + "px)";
  });
  updateHighlight();

  function mockRun(code){
    var lines = code.split("\n");
    var out = [];
    var vars = {};
    var functions = {};
    var functionPattern = /function\s+([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)?\s*\)\s*\{([\s\S]*?)\}/g;
    var functionMatch;
    while ((functionMatch = functionPattern.exec(code)) !== null) {
      var returnMatch = functionMatch[3].match(/\breturn\s+([\s\S]*?);?\s*$/);
      if (returnMatch) {
        functions[functionMatch[1]] = {
          parameter: functionMatch[2],
          expression: returnMatch[1].replace(/;\s*$/, "").trim()
        };
      }
    }
    function runLine(line){
      var varMatch = line.match(/^\s*(?:let|const|var)\s+(\w+)\s*=\s*(.+?);?\s*$/);
      if (varMatch) { vars[varMatch[1]] = varMatch[2].trim(); }
      var logMatch = line.match(/console\.log\((.+)\)\s*;?\s*$/);
      if (logMatch) { out.push(evalExpr(logMatch[1].trim(), vars, functions)); }
    }

    for (var lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      var loopMatch = lines[lineIndex].match(/^\s*for\s*\(\s*(?:(?:let|const|var)\s+)?([A-Za-z_$][\w$]*)\s*=\s*(-?\d+)\s*;\s*\1\s*(<=|<|>=|>)\s*(-?\d+)\s*;\s*\1\s*(\+\+|--|\+=\s*-?\d+|-=\s*-?\d+)\s*\)\s*\{\s*$/);
      if (!loopMatch) {
        runLine(lines[lineIndex]);
        continue;
      }

      var bodyEnd = lineIndex + 1;
      var braceDepth = 1;
      for (; bodyEnd < lines.length && braceDepth > 0; bodyEnd++) {
        braceDepth += (lines[bodyEnd].match(/\{/g) || []).length;
        braceDepth -= (lines[bodyEnd].match(/\}/g) || []).length;
      }
      if (braceDepth !== 0) { continue; }

      var variableName = loopMatch[1];
      var value = Number(loopMatch[2]);
      var operator = loopMatch[3];
      var limit = Number(loopMatch[4]);
      var stepText = loopMatch[5].replace(/\s/g, "");
      var step = stepText === "++" ? 1 : stepText === "--" ? -1 : Number(stepText.slice(2)) * (stepText.slice(0, 2) === "+=" ? 1 : -1);
      var condition = function(){
        if (operator === "<") { return value < limit; }
        if (operator === "<=") { return value <= limit; }
        if (operator === ">") { return value > limit; }
        return value >= limit;
      };

      for (var iteration = 0; iteration < 1000 && condition(); iteration++, value += step) {
        vars[variableName] = String(value);
        for (var bodyIndex = lineIndex + 1; bodyIndex < bodyEnd - 1; bodyIndex++) {
          runLine(lines[bodyIndex]);
        }
      }
      lineIndex = bodyEnd - 1;
    }
    return out.join("\n");
  }
  function evalExpr(expr, vars, functions){
    if (/^["'].*["']$/.test(expr)) return expr.slice(1,-1);
    if (/^-?\d+(\.\d+)?$/.test(expr)) return expr;
    if (expr === "true" || expr === "false") return expr;
    var callMatch = expr.match(/^([A-Za-z_$][\w$]*)\((.*)\)$/);
    if (callMatch && functions[callMatch[1]]) {
      var definedFunction = functions[callMatch[1]];
      var functionVars = Object.assign({}, vars);
      if (definedFunction.parameter) {
        functionVars[definedFunction.parameter] = evalExpr(callMatch[2], vars, functions);
      }
      return evalExpr(definedFunction.expression, functionVars, functions);
    }
    if (vars[expr] !== undefined) return evalExpr(vars[expr], vars, functions);
    if (expr.indexOf("+") > -1) {
      return expr.split("+").map(function(p){ return evalExpr(p.trim(), vars, functions); }).join("");
    }
    return expr;
  }

  document.getElementById("runBtn").addEventListener("click", function(){
    try {
      var result = mockRun(codeInput.value);
      outputArea.textContent = result || "(no output — try using console.log)";
      feedbackArea.textContent = "";
      feedbackArea.className = "feedback";
    } catch(err){
      outputArea.textContent = "Error running your code.";
    }
  });
  document.getElementById("resetBtn").addEventListener("click", function(){
    codeInput.value = currentExercise.code;
    updateHighlight();
    outputArea.textContent = "Run your code to see the output here.";
    feedbackArea.textContent = "";
    feedbackArea.className = "feedback";
  });
  document.getElementById("submitBtn").addEventListener("click", function(){
    var result = mockRun(codeInput.value);
    outputArea.textContent = result || "(no output)";
    if (result.trim() === currentExercise.expected.trim()) {
      feedbackArea.textContent = "✓ Correct! Expected output: " + currentExercise.expected;
      feedbackArea.className = "feedback ok";
    } else {
      feedbackArea.textContent = "Try again — check your variable names. Expected output: " + currentExercise.expected;
      feedbackArea.className = "feedback bad";
    }
  });

})();(function(){
  "use strict";

  window.CPLW = window.CPLW || {};

  var exercises = [
    {title:"Create Your First Variable", level:"Beginner", topic:"Variables", time:"5 min", code:'let name = "John";\nconsole.log(name);', expected:"John"},
    {title:"Check If a Number Is Positive", level:"Beginner", topic:"Conditions", time:"7 min", code:'let num = 5;\nif (num > 0) {\n  console.log("Positive");\n}', expected:"Positive"},
    {title:"Print Numbers 1 to 5", level:"Beginner", topic:"Loops", time:"8 min", code:'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}', expected:"1\n2\n3\n4\n5"},
    {title:"Write a Greeting Function", level:"Beginner", topic:"Functions", time:"6 min", code:'function greet(name) {\n  return "Hello " + name;\n}\nconsole.log(greet("CPLW"));', expected:"Hello CPLW"},
    {title:"Sum an Array of Numbers", level:"Intermediate", topic:"Arrays", time:"10 min", code:'let nums = [1, 2, 3, 4];\nlet sum = 0;\nfor (let n of nums) {\n  sum += n;\n}\nconsole.log(sum);', expected:"10"},
    {title:"Compare Two Variables", level:"Beginner", topic:"Variables", time:"5 min", code:'let a = 4;\nlet b = 7;\nconsole.log(a < b);', expected:"true"}
  ];
  window.CPLW.exercises = exercises;

  var filters = ["All","Beginner","Variables","Conditions","Loops","Functions","Arrays"];
  var filterRow = document.getElementById("filterRow");
  var activeFilter = "All";
  filters.forEach(function(f){
    var b = document.createElement("button");
    b.className = "filter-btn" + (f === "All" ? " active" : "");
    b.textContent = f;
    b.setAttribute("data-filter", f);
    b.addEventListener("click", function(){
      activeFilter = f;
      Array.prototype.forEach.call(filterRow.children, function(c){ c.classList.remove("active"); });
      b.classList.add("active");
      renderExercises();
    });
    filterRow.appendChild(b);
  });

  var exerciseGrid = document.getElementById("exerciseGrid");
  function renderExercises(){
    exerciseGrid.innerHTML = "";
    exercises
      .filter(function(e){
        if (activeFilter === "All") return true;
        if (activeFilter === "Beginner") return e.level === "Beginner";
        return e.topic === activeFilter;
      })
      .forEach(function(e){
        var el = document.createElement("div");
        el.className = "card ex-card";
        el.innerHTML =
          '<h3>'+e.title+'</h3>' +
          '<div class="ex-meta"><span>'+e.level+'</span><span>'+e.topic+'</span><span>'+e.time+'</span></div>' +
          '<button class="btn btn-secondary btn-sm" style="align-self:flex-start; margin-top:6px;">Start Exercise</button>';
        el.querySelector("button").addEventListener("click", function(){
          window.CPLW.loadExercise(e);
          document.getElementById("editorShell").scrollIntoView({behavior:"smooth", block:"start"});
        });
        exerciseGrid.appendChild(el);
      });
  }
  renderExercises();
  window.CPLW.loadExercise(exercises[0]);

})();
