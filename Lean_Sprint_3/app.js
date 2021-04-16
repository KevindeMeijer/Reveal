const express = require('express');
const revealRunInTerminal = require('reveal-run-in-terminal');

let app = express();

app.use(revealRunInTerminal({ allowRemote: true }));
app.use(express.static('node_modules/reveal.js'));


const fs = require('fs')
const SLIDES_FOLDER = './slides'
const SLIDES_PREFIX = '      <!-- Start slides -->'
const SLIDES_SUFFIX = '      <!-- End slides -->'

fs.watch('./slides/', async (event) => {
  if (event !== 'rename') return
  await new Promise(res => setTimeout(res, 10))

  const slideNames = await fs.promises.readdir(SLIDES_FOLDER)
  const chapterSlides = {}
  for (const filename of slideNames.filter(v => !v.endsWith('copy.md'))) {
    const [chapter] = parseSlide(filename)

    if (chapterSlides[chapter]) chapterSlides[chapter].push(filename)
    else chapterSlides[chapter] = [filename]
  }

  for (const copied of slideNames.filter(v => v.endsWith('copy.md'))) {
    const [chapter] = parseSlide(copied)
    const slides = chapterSlides[chapter].filter(v => !v.endsWith('copy.md'))
    const newSlide = parseSlide(getLast(slides))[1] + 1
    const filename = `slide-${chapter}-${newSlide}.md`

    await fs.promises.rename(`${SLIDES_FOLDER}/${copied}`, `${SLIDES_FOLDER}/${filename}`)

    if (chapterSlides[chapter]) chapterSlides[chapter].push(filename)
    else chapterSlides[chapter] = [filename]
  }

  let content = ''

  for (const chapter in chapterSlides) {
    const slidesHtml = chapterSlides[chapter]
      .map(file => `<section data-markdown="${SLIDES_FOLDER}/${file}" data-separator-notes="^Note:"></section>`)
      .join('\n        ')

    content += `\n      <section>\n        ${slidesHtml}\n      </section>\n`
  }

  let html = await fs.promises.readFile('./index.html', 'utf-8')

  html = ''
    + html.slice(0, html.indexOf(SLIDES_PREFIX) + SLIDES_PREFIX.length)
    + content
    + html.slice(html.indexOf(SLIDES_SUFFIX))

  await fs.promises.writeFile('./index.html', html)
  console.info(`Refreshed ./index.html with ${slideNames.length} slides`)
})

function parseSlide(filename) {
  return filename
    .slice(6, -3)
    .replace(/ copy/g, '')
    .split('-')
    .map(Number)
}

function getLast(arr) {
  return arr[arr.length - 1]
}

const PORT = 5000;
app.listen(PORT, 'localhost', () => console.log(`Server listening on http://localhost:${PORT}/`));