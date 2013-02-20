<h2>Tasks</h2>
<p>{{tasks.length}} current task(s)</p>
<table class="twelve">
    <thead>
    <tr>
        <th>Name</th>
        <th>Input(s)</th>
        <th>Output</th>
        <th>Progress</th>
        <th>Controls</th>
    </tr>
    </thead>
    <tbody class="taskTableBody">
    {{#tasks}}
    <tr>
        <td>{{name}}</td>
        <td>{{#inputs}}{{toJSON}}{{/inputs}}</td>
        <td>{{#result}}{{result}}{{/result}}{{^result}}Not yet terminated{{/result}}</td>
        <td>{{#running}}Running{{/running}}{{^running}}{{#result}}Terminated successfully{{/result}}{{^result}}Failed with message "{{failMsg}}"{{/result}}{{/running}}
        </td>
        <td>
            <ul class="button-group">
                <li><a href="#" class="button small alert stop" data-index="{{index}}">Stop</a></li>
                <li><a href="#" class="button small alert clear" data-index="{{index}}">Clear</a></li>
            </ul>
        </td>
    </tr>
    {{/tasks}}
    </tbody>
</table>
<a href="#" class="button alert" id="clearFinished">Clear Finished</a>
<a class="close-reveal-modal">×</a>

