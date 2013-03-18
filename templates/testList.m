<h2>Test Cases</h2>
<p>{{passing}}/{{total}} tests passed</p>

<!--<div class="nice alert progress"><span class="meter" style="width: 50%"></span></div>-->
<div class="nice progress success"><span class="meter" style="width:{{percent}}%"></span></div>
<table class="twelve">
    <thead>
    <tr>
        <th>Inputs</th>
        <th>Expected Output</th>
        <th>Status</th>
        <th>Last Output</th>
        <th>Controls</th>
    </tr>
    </thead>
    <tbody id="testTableBody">
        {{#tests}}
        <tr class="{{#passed}}pass{{/passed}}{{^passed}}fail{{/passed}}">
            <td>{{{inputMap}}}</td>
            <td><a href="#" class="edit" data-pk="{{index}}" data-type="text"
                   data-original-title="Enter output">{{output}}</a></td>
            <td>{{#hadError}}Error : {{failMsg}}{{/hadError}}
                {{^hadError}}
                    {{#running}}Test Running{{/running}}
                    {{^running}}
                        {{#passed}}Test passed{{/passed}}
                        {{^passed}}
                            {{^result}}Test has not passed{{/result}}
                        {{/passed}}
                    {{/running}}
                {{/hadError}}</td>
            <td> {{^hadError}}
                {{result}}
            {{/hadError}}</td>
            <td>
                <ul class="button-group">
                    {{^running}}
                        <li><a href="#" class="button small alert run" data-index="{{index}}">Run</a></li>
                        <li><a href="#" class="button small alert debug" data-index="{{index}}">Run in debug mode</a></li>
                    {{/running}}
                    {{#running}}
                        <li><a href="#" class="button small alert run" data-index="{{index}}">Restart</a></li>
                        <li><a href="#" class="button small alert debug" data-index="{{index}}">Restart in debug
                            mode</a></li>
                        {{#debug}}
                            <li><a href="#" class="button small alert resumedebug" data-index="{{index}}">Resume debugging</a></li>
                        {{/debug}}
                    {{/running}}
                    {{#running}}
                        <li><a href="#" class="button small alert stop" data-index="{{index}}">Stop</a></li>
                    {{/running}}
                </ul>
            </td>
        </tr>
        {{/tests}}
    </tbody>
</table>
<a href="#" class="button" id="addTestCase">Add Test Case</a><a href="#" class="button alert" id="runAll">Run All</a>
<a class="close-reveal-modal">×</a>

