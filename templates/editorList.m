{{#editors}}
    <li {{#active}}class="active"{{/active}}>
        <a href="#/editor/{{name}}">{{name}}{{#active}}&nbsp &nbsp
            <div class="tiny secondary button radius" href="#/close">x</div>
        {{/active}}</a>
    </li>
{{/editors}}
{{#hasDebugData}}
    <li> {{#debug}}class="active"{{/debug}}<a href="#/debug/">Debug{{#debug}}&nbsp &nbsp
        <div class="tiny secondary button radius" href="#/close">x</div>
    {{/debug}}</a></li>
{{/hasDebugData}}