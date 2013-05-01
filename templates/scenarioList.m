<a class="active" href="#">Lessons</a>
<ul class="dropdown">
<li><label>Lessons</label></li>
{{#categories}}
<li class="has-dropdown">
    <a href="#" class="">{{categoryName}}</a>
    <ul class="dropdown">
        <li><label>{{categoryName}}</label></li>
    {{#scenarios}}
        <li {{#activeScenario}}class="actived"{{/activeScenario}}>
            <a href="#/scenario/{{name}}">{{name}}</a>
        </li>
    {{/scenarios}}
    </ul>
</li>
{{/categories}}
<li class="divider"></li>
<li><label>Sandboxs</label></li>
{{#sandboxes}}
        <li {{#activeScenario}}class="actived"{{/activeScenario}}>
            <a href="#/scenario/{{name}}">{{name}}</a>
        </li>
{{/sandboxes}}
    <li class="divider"></li>
    <li><a href="#" id="newSandbox">New Sandbox</a></li>
</ul>