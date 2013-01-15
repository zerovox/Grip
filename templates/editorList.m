{{#editors}}
    <li {{^debug}}{{#activeEditor}}class="active"{{/activeEditor}}{{/debug}}>
        <a href="#/editor/{{name}}">{{name}}</a>
    </li>
{{/editors}}
{{#hasDebugData}}
    <li {{#debug}}class="active"{{/debug}}><a href="#/debug/">Debug</a></li>
{{/hasDebugData}}