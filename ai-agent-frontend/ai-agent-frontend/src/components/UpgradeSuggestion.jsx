import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const UpgradeSuggestion = ({ alert, isSimpleVersion }) => {
  const navigate = useNavigate();
  if (!isSimpleVersion) return null;

  const handleUpgrade = () => {
    navigate('/');
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Unlock {alert.feature}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{alert.message}</p>
          <Button className="w-full sm:w-auto" onClick={handleUpgrade}>
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UpgradeSuggestion;