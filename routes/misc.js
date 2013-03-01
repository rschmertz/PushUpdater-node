exports.misc = function(req, res) {
    var page = req.params.page;
    res.render(page, {});
};
