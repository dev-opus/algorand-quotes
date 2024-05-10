from pyteal import *
from quotes import Quote

if __name__ == "__main__":
    # Creating an instance of the Quote class
    quote = Quote()

    # Getting the approval and clear programs
    approval_program = quote.approval_program()
    clear_program = quote.clear_program()

    # Compiling and saving the approval program
    compiled_approval = compileTeal(approval_program, Mode.Application, version=6)
    with open("quotes_approval.teal", "w") as teal:
        teal.write(compiled_approval)  # Writing the compiled program to a file

    # Compiling and saving the clear program
    compiled_clear = compileTeal(clear_program, Mode.Application, version=6)
    with open("quotes_clear.teal", "w") as teal:
        teal.write(compiled_clear)  # Writing the compiled program to a file
