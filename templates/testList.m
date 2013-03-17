<h2>Test Cases</h2>
<p>{{passing}}/{{total}} tests passed</p>

<!--<div class="nice alert progress"><span class="meter" style="width: 50%"></span></div>-->
<div class="nice progress success"><span class="meter" style="width:{{percent}}%"></span></div>
<table class="twelve">
    <thead>
    <tr>
        <th>Inputs</th>
        <th>Output</th>
        <th>Pass?</th>
        <th>Run</th>
    </tr>
    </thead>
    <tbody id="testTableBody">
        {{#tests}}
        <tr>
            <td>{{{inputMap}}}</td>
            <td><a href="#" class="edit" data-pk="{{index}}" data-type="text" data-original-title="Enter output">{{output}}</a></td>
            <td>{{#running}}Test Running{{/running}}{{^running}}{{#passed}}Test passed{{/passed}}{{^passed}}{{^lastResult}}Not yet run{{/lastResult}}{{#lastResult}}Test failed with output {{lastResult}}{{/lastResult}}{{/passed}}{{/running}}</td>
            <td>
                <ul class="button-group">
                    <li><a href="#" class="button small alert run" data-index="{{index}}">Run</a></li>
                    <li><a href="#" class="button small alert debug" data-index="{{index}}">Debug</a></li>
                    <li><a href="#" class="button small alert stop" data-index="{{index}}">Stop</a></li>
                </ul>
            </td>
        </tr>
        {{/tests}}
    </tbody>
</table>
<a href="#" class="button" id="addTestCase">Add Test Case</a><a href="#" class="button alert" id="runAll">Run All</a>
<a class="close-reveal-modal">×</a>

