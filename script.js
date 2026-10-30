/* Think Like a Technician — simple, local-only learning simulator. */
(() => {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const steps = $$('.step');
  const panels = $$('[data-panel]');
  const state = { stage: 0, unlocked: 0, firstFocus: '', plan: [], tests: [], peerReviewed: false };
  const testData = {
    power: { title: 'Monitor power and message', result: 'The monitor is powered on and displays “No Signal.” This supports investigating the video signal path, but does not yet identify a specific fault.' },
    input: { title: 'Monitor input selection', result: 'The monitor is set to the expected HDMI 1 input. An incorrect input selection is less likely.' },
    cable: { title: 'External cable inspection (devices off)', result: 'The HDMI connector at the computer end appears partially unseated. This is a promising clue, not confirmation yet.' },
    retest: { title: 'Reseat cable and retest (devices off first)', result: 'After both devices were switched off, the external HDMI connector was secured. When power was restored, a normal picture appeared. The loose connector is supported as the cause in this simulated case.' }
  };

  function notify(selector, message, error = false) {
    const el = $(selector);
    el.textContent = message;
    el.classList.toggle('error', error);
  }

  function moveTo(stage, shouldScroll = true) {
    if (stage > state.unlocked || stage < 0 || stage >= panels.length) return;
    state.stage = stage;
    panels.forEach((panel, index) => { panel.hidden = index !== stage; });
    steps.forEach((button, index) => {
      button.classList.toggle('active', index === stage);
      button.classList.toggle('complete', index < state.unlocked);
      if (index === stage) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
      button.setAttribute('aria-label', `${index + 1}. ${button.querySelector('strong').textContent}${index > state.unlocked ? ', locked until previous stages' : ''}`);
      button.setAttribute('aria-disabled', index > state.unlocked ? 'true' : 'false');
    });
    const progress = Math.round((state.unlocked / 4) * 100);
    $('#progress-fill').style.width = `${progress}%`;
    $('.progress-rail').setAttribute('aria-valuenow', String(progress));
    if (stage === 4) $('#summary-hypothesis').textContent = $('#pattern').value || 'Not specified';
    if (shouldScroll) $('#work-area').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }

  function unlockAndMove(stage) {
    state.unlocked = Math.max(state.unlocked, stage);
    moveTo(stage);
  }

  steps.forEach((button) => button.addEventListener('click', () => moveTo(Number(button.dataset.step))));
  $$('[data-back]').forEach((button) => button.addEventListener('click', () => moveTo(Number(button.dataset.back))));

  $('#finish-0').addEventListener('click', () => {
    const selection = $('input[name="first-focus"]:checked');
    if (!selection) return notify('#mystery-feedback', 'Choose an area to investigate first.', true);
    state.firstFocus = selection.value;
    unlockAndMove(1);
  });
  $$('input[name="first-focus"]').forEach((input) => input.addEventListener('change', () => {
    notify('#mystery-feedback', input.value === 'Display / video path'
      ? 'Good starting point: the missing picture points toward the display/video signal path.'
      : 'That is one possibility, but the “No Signal” clue makes the display/video path a more useful first investigation.');
  }));

  function renderPlan() {
    const list = $('#algorithm-list');
    list.replaceChildren();
    if (state.plan.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-row';
      empty.textContent = 'Your ordered plan will appear here.';
      list.append(empty);
    } else {
      state.plan.forEach((step, index) => {
        const li = document.createElement('li');
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = `${step}  ×`;
        remove.title = 'Remove this step from the plan';
        remove.addEventListener('click', () => {
          state.plan.splice(index, 1);
          renderPlan();
        });
        li.append(remove);
        list.append(li);
      });
    }
    $$('#algorithm-options button').forEach((button) => { button.disabled = state.plan.includes(button.dataset.plan); });
  }
  $$('#algorithm-options button').forEach((button) => button.addEventListener('click', () => {
    if (!state.plan.includes(button.dataset.plan)) state.plan.push(button.dataset.plan);
    renderPlan();
  }));
  $('#finish-1').addEventListener('click', () => {
    const subsystem = $('#subsystem').value;
    const pattern = $('#pattern').value;
    const statement = $('#fault-statement').value.trim();
    const power = $('#safety-power').checked;
    const teacher = $('#safety-teacher').checked;
    if (!subsystem || !pattern || statement.length < 12 || state.plan.length < 2) {
      return notify('#plan-feedback', 'Complete the four CT areas: choose a subsystem and hypothesis, write a short fault statement, and add at least two ordered tests.', true);
    }
    if (!power || !teacher) return notify('#plan-feedback', 'The safety gate is mandatory. Please confirm both safety precautions before proceeding.', true);
    notify('#plan-feedback', 'Plan saved for this demo session. You can now run safe simulated checks.');
    unlockAndMove(2);
  });

  function renderLog() {
    const list = $('#log-list');
    list.replaceChildren();
    if (state.tests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Your test results will appear here as you investigate.';
      list.append(empty);
    } else {
      state.tests.forEach((key, index) => {
        const item = document.createElement('div');
        item.className = 'log-entry';
        const title = document.createElement('strong');
        title.textContent = `${index + 1}. ${testData[key].title}`;
        const description = document.createElement('small');
        description.textContent = testData[key].result;
        item.append(title, description);
        list.append(item);
      });
    }
    $('#test-count').textContent = `${state.tests.length} test${state.tests.length === 1 ? '' : 's'} logged`;
    $$('.test-tile').forEach((button) => button.classList.toggle('used', state.tests.includes(button.dataset.test)));
  }
  $$('.test-tile').forEach((button) => button.addEventListener('click', () => {
    if (!($('#safety-power').checked && $('#safety-teacher').checked)) {
      notify('#test-feedback', 'Please return to the planning stage and confirm both safety precautions.', true);
      return;
    }
    const key = button.dataset.test;
    if (!state.tests.includes(key)) state.tests.push(key);
    $('#test-result p').textContent = testData[key].result;
    renderLog();
    notify('#test-feedback', key === 'retest' ? 'The simulated repair worked. You can review a peer log next.' : 'Observation recorded. Choose another test or continue.');
  }));
  $('#finish-2').addEventListener('click', () => {
    if (state.tests.length < 1) return notify('#test-feedback', 'Run at least one simulated test before moving on.', true);
    unlockAndMove(3);
  });

  $('#check-peer').addEventListener('click', () => {
    const checked = $$('input[name="peer-issue"]:checked').map((item) => item.value);
    if (checked.length === 0) return notify('#peer-feedback', 'Choose at least one issue in the fictional peer log.', true);
    const correct = ['changed-two', 'unsupported', 'no-log'];
    const count = correct.filter((value) => checked.includes(value)).length;
    const wrong = checked.includes('speed');
    state.peerReviewed = true;
    $('#finish-3').disabled = false;
    notify('#peer-feedback', count === 3 && !wrong
      ? 'Exactly. Changing two variables at once, drawing an unsupported conclusion, and failing to log tests all weaken the diagnosis.'
      : 'Review: changing two parts at once hides the cause; the RAM conclusion is unsupported; and missing records prevent verification. Replacing more parts would make diagnosis less reliable.');
  });
  $('#finish-3').addEventListener('click', () => { if (state.peerReviewed) unlockAndMove(4); });

  function createNotes() {
    const tests = state.tests.map((key, index) => `${index + 1}. ${testData[key].title}\n   Observation: ${testData[key].result}`).join('\n');
    return [
      'THINK LIKE A TECHNICIAN — PRACTICE DEMO NOTES',
      'Fictional simulation only. For guided practice, not a graded assessment.',
      '', 'CASE: Fans spin, monitor displays “No Signal.”',
      'First focus: ' + (state.firstFocus || '(not selected)'),
      'Subsystem: ' + ($('#subsystem').value || '(not selected)'),
      'Hypothesis: ' + ($('#pattern').value || '(not selected)'),
      'Fault statement: ' + ($('#fault-statement').value.trim() || '(not entered)'),
      'SAFETY: confirmed in the demo before simulated tests',
      '', 'PLANNED ALGORITHM:', ...state.plan.map((step, i) => `${i + 1}. ${step}`),
      '', 'SIMULATED TEST LOG:', tests || '(no tests)',
      '', 'PEER DEBUGGING: fictional log reviewed',
      'SIMULATED CASE REVEAL: Loose external HDMI cable at PC end.',
      'REFLECTION: ' + ($('#reflection').value.trim() || '(not entered)'),
      '', 'No learner score, identifier, or real repair record is generated.'
    ].join('\n');
  }
  $('#download-log').addEventListener('click', () => {
    const blob = new Blob([createNotes()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'think-like-a-technician-practice-notes.txt';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  function resetDemo() {
    $$('.panel input[type="radio"], .panel input[type="checkbox"]').forEach((input) => { input.checked = false; });
    $$('.panel select').forEach((select) => { select.value = ''; });
    $$('.panel textarea').forEach((textarea) => { textarea.value = ''; });
    $$('.feedback').forEach((feedback) => { feedback.textContent = ''; feedback.classList.remove('error'); });
    state.stage = 0; state.unlocked = 0; state.firstFocus = ''; state.plan = []; state.tests = []; state.peerReviewed = false;
    $('#finish-3').disabled = true;
    $('#test-result p').textContent = 'Select a test above to reveal its observation.';
    renderPlan(); renderLog(); moveTo(0);
  }
  $('#reset-top').addEventListener('click', resetDemo);
  $('#restart-bottom').addEventListener('click', resetDemo);
  renderPlan(); renderLog(); moveTo(0, false);
})();
