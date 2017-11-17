const str = html`
<a href="${"something"}">
    ${['hello', 'world'].map(i => html`
        <p>
            ${i}
        </p>
    `)}
</a>
${1+2}

<hr>

<span>${true ? html`you sure? ${'no'}` : ""}</span>
`
