<ul class="tabs">
    <dt>Tasks</dt>
{{#editors}}
    <li {{^debug}}{{#activeEditor}}class="active"{{/activeEditor}}{{/debug}}>
        <a href="#/editor/{{name}}">{{name}}{{#passed}}<span class="tick has-tip" title="Passes all tests"> &#10004;</span>{{/passed}}</a>

    </li>
{{/editors}}
</ul>