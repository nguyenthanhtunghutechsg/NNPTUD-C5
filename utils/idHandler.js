module.exports = {
    GenID: function (data) {
        let ids = data.map(function (e) {
            return Number.parseInt(e.id)
        })
        return Math.max(...ids) + 1
    },
    getItemById: function (id, data) {
        let result = data.filter(
            function (e) {
                return e.id == id && !e.isDeleted
            }
        )
        if (result.length) {
            return result[0]
        }
        return false
    }
}