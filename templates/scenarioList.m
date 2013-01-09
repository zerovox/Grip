{{#categories}}
    <li class="has-flyout">
        <a>{{categoryName}}</a>
        <a class="flyout-toggle"><span> </span></a>
        <ul class="flyout">
            {{#scenarios}}
                <li {{#active}}class="active"{{/active}}>
                    <a href="#/scenario/{{name}}">{{name}}</a>
                </li>
            {{/scenarios}}
        </ul>
    </li>
{{/categories}}