<ul class="nav-bar vertical" id="scenarioMenu">
    {{#categories}}
        <li class="has-flyout">
            <a>{{categoryName}}</a>
            <a class="flyout-toggle"><span> </span></a>
            <ul class="flyout">
                {{#scenarios}}
                    <li {{#activeScenario}}class="active"{{/activeScenario}}>
                        <a href="#/scenario/{{name}}">{{name}}</a>
                    </li>
                {{/scenarios}}
            </ul>
        </li>
    {{/categories}}
</ul>