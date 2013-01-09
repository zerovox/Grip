<h2>Test Cases</h2>
<p>{{passing}}/{{total}} tests passed</p>

<!--<div class="nice alert progress"><span class="meter" style="width: 50%"></span></div>-->
<div class="nice progress success"><span class="meter" style="width: {{percent}}}%"></span></div>
<table class="twelve">
    <thead>
    <tr>
        <th>Inputs</th>
        <th>Output</th>
        <th>Run</th>
        <th>Pass?</th>
    </tr>
    </thead>
    <tbody id="testTableBody">
        {{#tests}}
        <tr>
            <td>{{#inputs}}{{toJSON}}{{/inputs}}</td>
            <td>{{output}}</td>
            <td>
                <ul class="button-group">
                    <li><a href="#/test/run/{{index}}" class="button small alert">Run</a></li>
                    <li><a href="#" class="button small alert">Run until first recursion</a></li>
                    <li><a href="#/test/debug/{{index}}" class="button small alert">Debug</a></li>
                </ul>
            </td>
            <td>{{#finished}}{{#passed}}Test Passed{{/passed}}{{^passed}}Test Failed{{/passed}}{{/finished}}{{^finished}}{{#passed}}Test currently running{{/passed}}{{^passed}}Test not yet run{{/passed}}{{/finished}}</td>
        </tr>
        {{/tests}}
    </tbody>
</table>
<a href="#" class="button" id="addTestCase">Add Test Case</a>
<a class="close-reveal-modal">×</a>

