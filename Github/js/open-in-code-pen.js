new Promise(res => setTimeout(res, 1500)).then(initCodeBlocks)

function initCodeBlocks() {
  for (const $code of document.querySelectorAll('pre code.hljs')) {
    if ($code.parentElement.parentElement.classList.contains('code-stack')) continue
    if ($code.parentElement.parentElement.classList.contains('no-codepen')) continue
    if ($code.parentElement.classList.contains('no-codepen')) continue

    const $submit = createBtn($code.textContent);
    $submit.style.position = 'absolute'
    $submit.style.right = '16px'
    $submit.style.bottom = '16px'
    $code.parentElement.appendChild($submit)
  }

  for (const $codeStack of document.querySelectorAll('.code-stack')) {
    let allCode = ''

    for (const $code of $codeStack.querySelectorAll('pre code.hljs')) {
      allCode += '\n'
      allCode += $code.textContent;
    }

    const $submit = createBtn(allCode, 'Open all in codepen');
    $submit.style.position = 'absolute'
    $submit.style.right = '16px'
    $submit.style.bottom = '16px'
    $codeStack.querySelector('pre:last-child').appendChild($submit)
  }

  for (const $a of document.querySelectorAll('a')) {
    $a.target = '_blank'
    $a.title = 'Open ' + $a.getAttribute('href') + ' in a new tab'
  }
}

function createBtn(code, label = 'Open in Codepen') {
  const $submit = document.createElement('button')
  $submit.type = 'submit'
  $submit.innerHTML = `<span>${label}</span>`
  $submit.className = 'button code-pen'

  $submit.onclick = function () {
    const $form = createForm(code)
    document.body.appendChild($form)
    $form.submit()
  }

  return $submit
}

function createForm(javascript) {

  javascript += `
  
// Only for in codepen!
ReactDOM.render(
  <App/>,
  document.getElementById('root')
);`

  const payload = {
    title: 'Test',
    description: 'A test',
    header: "<meta name='viewport' content='width=device-width'>",
    html: '<div id="root"></div>',
    js_pre_processor: 'babel',
    editors: '001',
    layout: 'left',
    editable: false,
    js_external: [
      'https://unpkg.com/react@16.8.6/umd/react.development.js',
      'https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js',
    ].join(';'),
    js: javascript
  }

  const $inputData = document.createElement('input')
  $inputData.type = 'hidden'
  $inputData.value = JSON.stringify(payload)
  $inputData.name = 'data'


  const $form = document.createElement('form')
  $form.target = '_blank'
  $form.action = 'https://codepen.io/pen/define'
  $form.method = 'POST'

  $form.appendChild($inputData)

  return $form;
}