var app = angular.module("app", ["ngDialog", "ui.sortable"]);

app.config(['ngDialogProvider', function (ngDialogProvider) {
    ngDialogProvider.setDefaults({
        //className: 'ngdialog-theme-default',
        //plain: true,
        showClose: true,
        closeByDocument: true,
        closeByEscape: true
    });
}]);