class Quote:
    def __init__(self):
        self.author_key = "AUTHOR"
        self.body_key = "BODY"
        self.image_key = "IMAGE"
        self.tip_received_key = "TIP_RECEIVED"
        self.total_rating_key = "TOTAL_RATING"
        self.times_rated_key = "TIMES_RATED"
        self.times_tipped_key = "TIMES_TIPPED"

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(3)),
            Assert(Txn.note() == Bytes("algorand-quotes:uv1")),
            App.globalPut(self.author_key, Txn.application_args[0]),
            App.globalPut(self.body_key, Txn.application_args[1]),
            App.globalPut(self.image_key, Txn.application_args[2]),
            App.globalPut(self.tip_received_key, Int(0)),
            App.globalPut(self.total_rating_key, Int(0)),
            App.globalPut(self.times_rated_key, Int(0)),
            App.globalPut(self.times_tipped_key, Int(0)),
            Approve(),
        ])

    def tip(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        valid_tipper = Txn.sender() != Global.creator_address()
        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_tip = And(valid_number_of_transactions, valid_payment_to_seller, valid_tipper)
        update_state = self._update_state(self.tip_received_key, self.times_tipped_key, Gtxn[1].amount())

        return If(can_tip).Then(update_state).Else(Reject())

    def rate(self):
        rating = Btoi(Txn.application_args[1])
        rateable = Txn.sender() != Global.creator_address()
        valid_rating = And(rating > Int(0), rating <= Int(5))

        can_rate = And(rateable, valid_rating)
        update_rating = self._update_state(self.total_rating_key, self.times_rated_key, rating)

        return If(can_rate).Then(update_rating).Else(Reject())

    def _update_state(self, value_key, counter_key, value):
        return Seq([
            App.globalPut(value_key, App.globalGet(value_key) + value),
            App.globalPut(counter_key, App.globalGet(counter_key) + Int(1)),
            Approve(),
        ])

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == Bytes("tip"), self.tip()],
            [Txn.application_args[0] == Bytes("rate"), self.rate()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
