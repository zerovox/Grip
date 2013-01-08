{{#editors}}
    <li {{^debug}}{{#active}}class="active"{{/active}}{{/debug}}>
        <a href="#/editor/{{name}}">{{name}}{{^debug}}{{#active}}&nbsp &nbsp
    <div class="tiny secondary button radius" href="#/close">x</div>
{{/active}}{{/debug}}</a>
</li>
{{/editors}}
{{#hasDebugData}}
    <li {{#debug}}class="active"{{/debug}}><a href="#/debug/">Debug{{#debug}}&nbsp &nbsp
        <div class="tiny secondary button radius" href="#/close">x</div>
    {{/debug}}</a></li>
{{/hasDebugData}}