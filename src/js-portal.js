/* globals Elm */
function spellCheck(word) {
  return ['I\'m working!', word];
}

const app = Elm.Spelling.fullscreen();
app.ports.check.subscribe((word) => {
  const suggestions = spellCheck(word);
  app.ports.suggestions.send(suggestions);
});
