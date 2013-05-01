<ul class="tabs">
    {{^sandbox}}
        <dt>Tasks</dt>
    {{/sandbox}}
    {{#sandbox}}
        <dt>Functions</dt>
    {{/sandbox}}
    {{#editors}}
        <li {{^debug}}{{#activeEditor}}class="active"{{/activeEditor}}{{/debug}}>
            <a href="#/editor/{{name}}">{{name}}{{#passed}}<span class="tick has-tip"
                                                                 title="Passes all tests"> &#10004;</span>{{/passed}}
            </a>

        </li>
    {{/editors}}
    {{#sandbox}}
        <dt><a href="#" id="newFunction">New function</a></dt>
    {{/sandbox}}
</ul>