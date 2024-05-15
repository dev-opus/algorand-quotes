from pyteal import *

class Quote:
    class Variables:
        author = Bytes("AUTHOR")
        body = Bytes("BODY")
        image = Bytes("IMAGE")
        tip_received = Bytes("TIP_RECEIVED")
        total_rating = Bytes("TOTAL_RATING")
        times_rated = Bytes("TIMES_RATED")
        times_tipped = Bytes("TIMES_TIPPED")

    class AppMethods:
        tip = Bytes("tip")
        rate = Bytes("rate")

    def application_creation(self):
        return Seq(
            [
                Assert(Txn.application_args.length() == Int(3)),
                Assert(Txn.note() == Bytes("algorand-quotes:uv1")),
                App.globalPut(self.Variables.author, Txn.application_args[0]),
                App.globalPut(self.Variables.body, Txn.application_args[1]),
                App.globalPut(self.Variables.image, Txn.application_args[2]),
                App.globalPut(self.Variables.tip_received, Int(0)),
                App.globalPut(self.Variables.total_rating, Int(0)),
                App.globalPut(self.Variables.times_rated, Int(0)),
                App.globalPut(self.Variables.times_tipped, Int(0)),
                Approve(),
            ]
        )

    def tip(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        valid_tipper = Txn.sender() != Global.creator_address()
        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_tip = And(
            valid_number_of_transactions, valid_payment_to_seller, valid_tipper
        )
        update_state = Seq(
            [
                App.globalPut(
                    self.Variables.tip_received,
                    App.globalGet(self.Variables.tip_received) + Gtxn[1].amount(),
                ),
                App.globalPut(
                    self.Variables.times_tipped,
                    App.globalGet(self.Variables.times_tipped) + Int(1),
                ),
                Approve(),
            ]
        )

        return If(can_tip).Then(update_state).Else(Reject())

    def rate(self):
        rating = Btoi(Txn.application_args[1])
        rateable = Txn.sender() != Global.creator_address()
        valid_rating = And(rating > Int(0), rating <= Int(5))

        can_rate = And(rateable, valid_rating)

        update_rating = Seq(
            [
                App.globalPut(
                    self.Variables.total_rating,
                    App.globalGet(self.Variables.total_rating) + rating,
                ),
                App.globalPut(
                    self.Variables.times_rated,
                    App.globalGet(self.Variables.times_rated) + Int(1),
                ),
                Approve(),
            ]
        )

        return If(can_rate).Then(update_rating).Else(Reject())

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [
                Txn.on_completion() == OnComplete.DeleteApplication,
                self.application_deletion(),
            ],
            [Txn.application_args[0] == self.AppMethods.tip, self.tip()],
            [Txn.application_args[0] == self.AppMethods.rate, self.rate()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))

# To compile the program, you would use the following lines:
if __name__ == "__main__":
    quote = Quote()
    approval_program = quote.approval_program()
    clear_program = quote.clear_program()

    compiled_approval = compileTeal(approval_program, mode=Mode.Application, version=3)
    compiled_clear = compileTeal(clear_program, mode=Mode.Application, version=3)

    print("Approval Program:")
    print(compiled_approval)

    print("Clear Program:")
    print(compiled_clear)
