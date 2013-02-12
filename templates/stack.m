<li class="title">Stack Trace</li>
{{#stack}}
    <li {{#active}}class="price"{{/active}}{{^active}}class="bullet-item"{{/active}}>
        <a href="#/stack/{{index}}">{{name}}</a>
    </li>
{{/stack}}