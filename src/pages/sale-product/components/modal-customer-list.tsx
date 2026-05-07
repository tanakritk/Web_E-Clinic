import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { MasterCustomerModel } from "@/api/controller/master-customer";

interface ModalCustomerListProps {
  open: boolean;
  onClose: () => void;
  customers: MasterCustomerModel[];
  onSelect: (customer: MasterCustomerModel) => void;
}

export const ModalCustomerList = ({
  open,
  onClose,
  customers,
  onSelect,
}: ModalCustomerListProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          เลือกข้อมูลลูกค้า
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {customers.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" py={4}>
            ไม่พบข้อมูลลูกค้า
          </Typography>
        ) : (
          <List>
            {customers.map((customer, index) => (
              <div key={customer.id || index}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onSelect(customer)}
                    sx={{ borderRadius: 2, my: 0.5 }}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="bg-pink-50 p-2 rounded-full">
                        <PersonIcon className="text-pink-500" />
                      </div>
                      <ListItemText
                        primary={
                          <Typography fontWeight="bold">
                            {customer.title} {customer.firstname}{" "}
                            {customer.surname}
                            {customer.nickname
                              ? "(" + customer.nickname + ")"
                              : ""}
                          </Typography>
                        }
                        secondary={`รหัส: ${customer.code || "-"} | เบอร์โทรศัพท์: ${
                          customer.phone || "-"
                        }`}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        className="shrink-0"
                      >
                        เลือก
                      </Button>
                    </div>
                  </ListItemButton>
                </ListItem>
                {index < customers.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};
