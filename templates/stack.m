<li class="title">Stack Trace</li>
{{#stack}}
    <li {{#active}}class="price"{{/active}}{{^active}}class="bullet-item"{{/active}}>
        <a href="#" data-index="{{index}}" class="level">{{name}}</a>
    </li>
{{/stack}}