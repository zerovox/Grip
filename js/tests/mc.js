define([
    'models/ScenariosModel',
    'models/ScenarioModel',
    'models/EditorModel',
    'models/FunctionModel',
    'models/TaskModel',
    'models/TestModel',
    'collections/Scenarios',
    'collections/Editors',
    'collections/Tests',
    'collections/Functions',
    'libs/text!data/scenarios.json'
], function (ScenariosModel, ScenarioModel, EditorModel, FunctionModel, TaskModel, TestModel, ScenarioCollection, EditorCollection, TestCollection, FunctionCollection, ScenariosJSON) {
    var scenarios = new ScenariosModel(JSON.parse(ScenariosJSON));
    var scenariosList = scenarios.get("all");
    var scenario = scenarios.get("activeScenario");
    var functions = scenario.get("functions")
    var func = functions.first();
    var editors = scenario.get("list")
    var editor = scenario.get("activeEditor");
    var tests = editor.get("tests")

    describe('Models', function () {
        describe('Scenarios Model', function () {
            it('should be an instance of the scenarios model', function () {
                scenarios.should.be.instanceOf(ScenariosModel)
            })
            it('should have the correct interface', function () {
                scenarios.should.have.interface(["swap"]);
            });
            it('should have the correct properties', function () {
                scenarios.should.have.attributes(["all", "activeScenario"]);
            })
        });

        describe('Scenario Model', function () {
            it('should be an instance of the scenario model', function () {
                scenario.should.be.instanceOf(ScenarioModel)
            })
            it('should have the correct interface', function () {
                scenario.should.have.interface(["swap", "runTest", "swapActiveDebug", "newEditorFromJson", "newEditor", "toHaskell"]);
            });
            it('should have the correct properties', function () {
                scenario.should.have.attributes(["name", "list", "functions", "activeEditor"])
            })
            it('should have a list of editor', function () {
                scenario.has("list").should.be.true;
            })
            it('should have an active editor', function () {
                scenario.has("activeEditor").should.be.true;
            })
            it('should have a function collection attached', function () {
                scenario.has("functions").should.be.true;
            })
        });

        describe('Editor Model', function () {
            it('should be an instance of the editor model', function () {
                editor.should.be.instanceOf(EditorModel)
            })
            it('should have the correct interface', function () {
                editor.should.have.interface(["addFunction", "removeFunction", "addInput", "linkOutput", "linkInput", "move", "removeInput", "toHaskell"]);
            });
            it('should have the correct properties', function () {
                editor.should.have.attributes(["map", "tests"]);
            })
            it('should have some tests attached', function () {
                editor.has("tests").should.be.true;
            })
        });

        describe('Function Model', function(){
            it('should be an instance of the function model', function () {
                func.should.be.instanceOf(FunctionModel)
            })
            it('should have the correct properties', function () {
                func.should.have.attributes(["group", "func"]);
            })
        })

        describe('Test Model', function(){
            it('should be an instance of the task model')
            it('should have the correct properties')
            it('should have the correct interface')
        })

        describe('Task Model', function(){
            it('should be an instance of the task model')
            it('should have the correct properties')
            it('should have the correct interface')
        })
    });

    describe('Collections', function () {
        describe('Scenario Collection', function () {
            it('should be an instance of the scenarios collection', function () {
                scenariosList.should.be.instanceOf(ScenarioCollection)
            })
            it('should be an have some memebers', function () {
                scenariosList.size().should.be.above(0)
            })
        });

        describe('Function Collection', function () {
            it('should be an instance of the scenarios collection', function () {
                functions.should.be.instanceOf(FunctionCollection)
            })
            it('should be an have some memebers', function () {
                functions.size().should.be.above(0)
            })
        });

        describe('Editor Collection', function () {
            it('should be an instance of the scenarios collection', function () {
                editors.should.be.instanceOf(EditorCollection)
            })
            it('should be an have some memebers', function () {
                editors.size().should.be.above(0)
            })
        });

        describe('Test Collection', function () {
            it('should be an instance of the tests collection', function () {
                tests.should.be.instanceOf(TestCollection)
            })
            it('should be an have some memebers', function () {
                tests.size().should.be.above(0)
            })
            it('should be able to add a new test case', function () {
                tests.should.have.interface(["newEmptyCase"])
                var size = tests.size()
                var test = tests.newEmptyCase()
                tests.size().should.be.equal(size + 1)
                console.log(test)
                test.should.be.instanceOf(TestModel)
                test.should.have.attributes(["inputs", "output", "finished", "passed"])
                test.should.not.have.attributes(["task"])
                test.get("passed").should.be.false;
                test.get("finished").should.be.false;
            })
        });
    });
});