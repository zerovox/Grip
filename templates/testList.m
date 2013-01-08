{{#tests}}
<tr>
    <td>{{inputs}}</td>
    <td>{{output}}</td>
    <td>
        <ul class="button-group">
            <li><a href="#/test/run/{{index}}" class="button small alert">Run</a></li>
            <li><a href="#" class="button small alert">Run until first recursion</a></li>
            <li><a href="#" class="button small alert">Debug</a></li>
        </ul>
    </td>
    <td>{{status}}</td>
</tr>
{{/tests}}