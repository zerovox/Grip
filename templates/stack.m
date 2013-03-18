<ul class="pricing-table">
<li class="title">Execution Path</li>
{{#stack}}
    <li {{#active}}class="price"{{/active}}{{^active}}class="bullet-item"{{/active}}>
        <a href="#" data-index="{{index}}" class="level">{{name}}</a>
    </li>
{{/stack}}
</ul>