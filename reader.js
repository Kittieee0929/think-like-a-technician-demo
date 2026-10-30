(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const root = $('#module-content');
  const picker = $('#module-picker');
  if (!root || !picker || !Array.isArray(COURSE)) return;
  const params = new URLSearchParams(window.location.search);
  const initial = Number(params.get('m'));
  let current = Number.isInteger(initial) && initial >= 0 && initial < COURSE.length ? initial : 0;
  let hasSubmitted = false;
  const answers = new Map();

  const el = (tag, className, content) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (content !== undefined) e.textContent = String(content);
    return e;
  };

  COURSE.forEach((module, i) => {
    const opt = new Option(`${i+1}. ${module.title}`, String(i));
    picker.add(opt);
  });

  function render() {
    hasSubmitted = false;
    answers.clear();
    root.replaceChildren();
    const module = COURSE[current];
    const header = el('section','module-header');
    header.append(el('p','eyebrow',`MODULE ${String(current+1).padStart(2,'0')} / ${COURSE.length}`));
    header.append(el('h1','',module.title));
    header.append(el('p','module-intro',`${module.tag}. Read the discussion, then check your understanding with a short quiz.`));
    const quick = el('a','text-link','Jump to quiz ↓');
    quick.href = '#quiz';
    header.append(quick);
    root.append(header);

    const discussion = el('section','discussion');
    discussion.id = 'discussion';
    discussion.append(el('h2','section-label','Discussion'));
    module.lessons.forEach((lesson) => {
      const [title, introduction, explanation, example, takeaway] = lesson;
      const part = el('article','topic');
      part.append(el('h3','',title));
      part.append(el('p','',introduction));
      part.append(el('p','',explanation));
      const worked = el('p','example');
      worked.append(el('strong','', 'Example: '));
      worked.append(document.createTextNode(example));
      part.append(worked);
      const remember = el('p','takeaway');
      remember.append(el('strong','', 'Key point: '));
      remember.append(document.createTextNode(takeaway));
      part.append(remember);
      discussion.append(part);
    });
    root.append(discussion);

    const quiz = el('section','quiz');
    quiz.id = 'quiz';
    quiz.append(el('p','eyebrow','CHECK YOUR UNDERSTANDING'));
    quiz.append(el('h2','','Module Quiz'));
    quiz.append(el('p','quiz-lead',`Answer all ${module.lessons.length} questions, then press Submit Quiz to see your score and explanations.`));
    const form = el('form','quiz-form');
    form.id = 'quiz-form';
    form.noValidate = true;
    module.lessons.forEach((lesson, qi) => {
      const [, , , , , question, options] = lesson;
      const fieldset = el('fieldset','question');
      const legend = el('legend','',`${qi+1}. ${question}`);
      fieldset.append(legend);
      options.forEach((option, oi) => {
        const label = el('label','answer-option');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `q${qi}`;
        radio.value = String(oi);
        radio.addEventListener('change', () => {
          answers.set(qi, oi);
          if (hasSubmitted) { hasSubmitted = false; resetFeedback(); }
        });
        const text = el('span','', `${String.fromCharCode(65+oi)}. ${option}`);
        label.append(radio, text);
        fieldset.append(label);
      });
      const explanation = el('div','answer-explanation');
      explanation.id = `feedback-${qi}`;
      explanation.hidden = true;
      fieldset.append(explanation);
      form.append(fieldset);
    });
    const actions = el('div','quiz-actions');
    const submit = el('button','button button-primary','Submit Quiz');
    submit.type = 'submit';
    const retry = el('button','button button-outline','Try Again');
    retry.type = 'button';
    retry.id = 'retry-quiz';
    retry.hidden = true;
    actions.append(submit,retry);
    form.append(actions);
    const result = el('div','quiz-result');
    result.id = 'quiz-result';
    result.setAttribute('role','status');
    result.setAttribute('aria-live','polite');
    form.append(result);
    quiz.append(form);
    root.append(quiz);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const count = module.lessons.length;
      if (answers.size < count) {
        result.className = 'quiz-result quiz-warning';
        result.textContent = `Please answer all ${count} questions before submitting (${answers.size}/${count} answered).`;
        return;
      }
      let correctCount = 0;
      module.lessons.forEach((lesson, qi) => {
        const correct = lesson[7];
        const chosen = answers.get(qi);
        const right = chosen === correct;
        if (right) correctCount++;
        const feedback = $(`#feedback-${qi}`);
        feedback.hidden = false;
        feedback.className = 'answer-explanation '+(right?'right':'wrong');
        feedback.textContent = `${right?'Correct.':'Not quite.'} ${lesson[8]}`;
        const radios = [...form.querySelectorAll(`input[name="q${qi}"]`)];
        radios.forEach((radio,i) => {
          const label = radio.closest('label');
          label.classList.toggle('answer-correct',i===correct);
          label.classList.toggle('answer-incorrect',i===chosen&&!right);
        });
      });
      const percentage = Math.round(correctCount/count*100);
      result.className = 'quiz-result quiz-success';
      result.textContent = `Your score: ${correctCount} out of ${count} (${percentage}%). Review the explanations above or try again.`;
      retry.hidden = false;
      hasSubmitted = true;
      result.scrollIntoView({behavior:'smooth',block:'center'});
    });
    retry.addEventListener('click', () => {
      form.reset();
      answers.clear();
      hasSubmitted = false;
      resetFeedback();
      retry.hidden = true;
      quiz.scrollIntoView({behavior:'smooth',block:'start'});
    });
    function resetFeedback() {
      form.querySelectorAll('.answer-explanation').forEach(e=>{e.hidden=true;e.textContent='';});
      form.querySelectorAll('.answer-option').forEach(e=>e.classList.remove('answer-correct','answer-incorrect'));
      result.textContent=''; result.className='quiz-result';
      retry.hidden = true;
    }
    picker.value = String(current);
    $('#previous-module').disabled = current === 0;
    $('#next-module').disabled = current === COURSE.length - 1;
    document.title = `${module.title} | Think Like a Technician`;
  }
  function go(index) {
    current = index;
    window.history.replaceState({}, '', `learn.html?m=${current}`);
    render();
    window.scrollTo({top:0,behavior:'instant'});
  }
  picker.addEventListener('change',()=>go(Number(picker.value)));
  $('#previous-module').addEventListener('click',()=>{if(current>0)go(current-1);});
  $('#next-module').addEventListener('click',()=>{if(current<COURSE.length-1)go(current+1);});
  render();
})();