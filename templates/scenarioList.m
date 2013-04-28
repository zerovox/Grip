<a class="active" href="#">Lessons</a>
<ul class="dropdown">
<li><label>Lessons</label></li>
{{#categories}}
<li class="has-dropdown">
    <a href="#" class="">{{categoryName}}</a>
    <ul class="dropdown">
    {{#scenarios}}
        <li {{#activeScenario}}class="actived"{{/activeScenario}}>
            <a href="#/scenario/{{name}}">{{name}}</a>
        </li>
    {{/scenarios}}
    </ul>
</li>
{{/categories}}
<li class="divider"></li>
<li><label>Sandbox</label></li>
<li><a href="#">Sandbox</a></li>
</ul>