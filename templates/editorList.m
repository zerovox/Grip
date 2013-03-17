{{#editors}}
    <li {{^debug}}{{#activeEditor}}class="active"{{/activeEditor}}{{/debug}}>
        <a href="#/editor/{{name}}">{{name}}</a>
    </li>
{{/editors}}