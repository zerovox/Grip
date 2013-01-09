{{#editors}}
    <li {{^debug}}{{#activeEditor}}class="active"{{/activeEditor}}{{/debug}}>
        <a href="#/editor/{{name}}">{{name}}{{^debug}}{{#activeEditor}}&nbsp &nbsp
            <div class="tiny secondary button radius" href="#/close">x</div>
        {{/activeEditor}}{{/debug}}</a>
    </li>
{{/editors}}
{{#hasDebugData}}
    <li {{#debug}}class="active"{{/debug}}><a href="#/debug/">Debug{{#debug}}&nbsp &nbsp
        <div class="tiny secondary button radius" href="#/close">x</div>
    {{/debug}}</a></li>
{{/hasDebugData}}